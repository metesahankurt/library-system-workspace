const fs = require('fs');
const path = require('path');
const { createStrapi } = require('@strapi/strapi');
const os = require('os');

async function migrate() {
  console.log('Starting migration for all books with PHOTOS...');
  const instance = await createStrapi({ distDir: './dist' }).load();
  global.strapi = instance;

  const sqlFileBooks = '/Users/taha/Desktop/library-system-workspace-main/books.sql';
  const sqlFileOthers = '/Users/taha/Desktop/library-system-workspace-main/u741904765_kutuphane-2.sql';
  // Removed TEST_LIMIT for full migration

  const decodeSqlBlob = (buffer) => {
    if (!buffer || buffer.length === 0) return null;
    let start = 0;
    let end = buffer.length;
    if (buffer[0] === 39 && buffer[buffer.length - 1] === 39) { // Single quotes
      start = 1;
      end = buffer.length - 1;
    }
    const result = Buffer.alloc(end - start);
    let j = 0;
    for (let i = start; i < end; i++) {
      if (buffer[i] === 92 && i + 1 < end) { // backslash \
        const next = buffer[i + 1];
        if (next === 48) { result[j++] = 0; i++; } // \0
        else if (next === 39) { result[j++] = 39; i++; } // \'
        else if (next === 34) { result[j++] = 34; i++; } // \"
        else if (next === 92) { result[j++] = 92; i++; } // \\
        else if (next === 110) { result[j++] = 10; i++; } // \n
        else if (next === 114) { result[j++] = 13; i++; } // \r
        else if (next === 116) { result[j++] = 9; i++; } // \t
        else if (next === 90) { result[j++] = 26; i++; } // \Z
        else { result[j++] = buffer[i]; }
      } else {
        result[j++] = buffer[i];
      }
    }
    return result.slice(0, j);
  };

  const uploadFile = async (buffer, fileName, refId, field) => {
    if (!buffer || buffer.length < 500) return null;
    const tmpPath = path.join(os.tmpdir(), fileName);
    fs.writeFileSync(tmpPath, buffer);

    try {
      const uploadService = instance.plugin('upload').service('upload');

      const fileData = {
        path: tmpPath,
        filepath: tmpPath,
        name: fileName,
        mime: 'image/jpeg',
        size: buffer.length,
        ext: '.jpg',
        getStream: () => fs.createReadStream(tmpPath),
      };

      const uploadedFiles = await uploadService.upload({
        data: {
          fileInfo: {
            name: fileName,
            alternativeText: fileName,
            caption: fileName,
          }
        },
        files: fileData,
      });

      const uploadedFile = uploadedFiles[0];

      // Manually link to book
      if (uploadedFile) {
        await instance.db.query('api::book.book').update({
          where: { id: refId },
          data: { [field]: uploadedFile.id }
        });
      }

      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      return uploadedFile;
    } catch (e) {
      // console.error(`Upload error for ${fileName}:`, e.message);
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      return null;
    }
  };

  const parseSqlTable = async (filePath, tableName, callback) => {
    const insertHeader = `INSERT INTO \`${tableName}\``;
    const fd = fs.openSync(filePath, 'r');
    const stats = fs.fstatSync(fd);
    const totalSize = stats.size;
    let pos = 0;
    const readBuf = Buffer.alloc(1024 * 1024);

    let inValues = false;
    let inRecord = false;
    let inString = false;
    let isEscaped = false;
    let currentRecordFields = [];
    let currentFieldBytes = [];
    let headerMatchPos = 0;
    let count = 0;

    while (pos < totalSize) {
      const bytesRead = fs.readSync(fd, readBuf, 0, readBuf.length, pos);
      if (bytesRead === 0) break;

      for (let i = 0; i < bytesRead; i++) {
        const byte = readBuf[i];
        const char = String.fromCharCode(byte);
        if (!inValues) {
          if (char === insertHeader[headerMatchPos]) {
            headerMatchPos++;
            if (headerMatchPos === insertHeader.length) {
              inValues = true;
              headerMatchPos = 0;
            }
          } else {
            headerMatchPos = 0;
          }
        } else {
          if (!inRecord) {
            if (char === '(') {
              inRecord = true;
              currentRecordFields = [];
              currentFieldBytes = [];
            } else if (char === ';') {
              inValues = false;
            }
          } else {
            if (inString) {
              if (isEscaped) {
                currentFieldBytes.push(byte);
                isEscaped = false;
              } else if (char === '\\') {
                isEscaped = true;
                currentFieldBytes.push(byte);
              } else if (char === "'") {
                inString = false;
                currentFieldBytes.push(byte);
              } else {
                currentFieldBytes.push(byte);
              }
            } else {
              if (char === "'") {
                inString = true;
                currentFieldBytes.push(byte);
              } else if (char === ',') {
                currentRecordFields.push(Buffer.from(currentFieldBytes));
                currentFieldBytes = [];
              } else if (char === ')') {
                currentRecordFields.push(Buffer.from(currentFieldBytes));
                await callback(currentRecordFields);
                count++;
                inRecord = false;
                currentFieldBytes = [];
              } else {
                if (char !== ' ' || currentFieldBytes.length > 0) {
                  currentFieldBytes.push(byte);
                }
              }
            }
          }
        }
      }
      pos += bytesRead;
    }
    fs.closeSync(fd);
  };

  const cleanField = (buf) => {
    if (!buf || buf.length === 0) return null;
    let s = buf.toString('utf8').trim();
    if (s === 'NULL') return null;
    if (s.startsWith("'") && s.endsWith("'")) {
      return s.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    return s;
  };

  // 1. Sync Categories (Fast, no limit)
  console.log('Syncing Categories...');
  const catMap = {};
  await parseSqlTable(sqlFileOthers, 'categories', async (fields) => {
    const id = cleanField(fields[0]);
    const name = cleanField(fields[1]);
    if (!name) return;
    let cat = await instance.db.query('api::category.category').findOne({ where: { name } });
    if (!cat) {
      cat = await instance.entityService.create('api::category.category', { data: { name, publishedAt: new Date() } });
    }
    catMap[id] = cat.id;
  });

  // 2. Clear first 20 books (or all if we want fresh test)
  console.log('Clearing existing data for clean test...');
  await instance.db.query('api::loan.loan').deleteMany({});
  await instance.db.query('api::reservation.reservation').deleteMany({});
  await instance.db.query('api::book.book').deleteMany({});
  // Also clear Media entries to avoid cluttering during tests
  await instance.db.query('plugin::upload.file').deleteMany({});

  // 3. Import 6190 Books with Photos
  console.log(`Importing all 6190 books with PHOTOS (this will take time)...`);
  let bookCount = 0;
  await parseSqlTable(sqlFileBooks, 'books', async (fields) => {
    const data = {
      title: cleanField(fields[2]),
      author: cleanField(fields[3]),
      publisher: cleanField(fields[4]),
      publishYear: parseInt(cleanField(fields[5])) || null,
      isbn: cleanField(fields[6]),
      bookCode: cleanField(fields[7]),
      barcodeNumber: cleanField(fields[8]),
      barcodeImage: cleanField(fields[9]),
      description: cleanField(fields[12]),
      pageCount: parseInt(cleanField(fields[13])) || null,
      quantity: parseInt(cleanField(fields[14])) || 1,
      availableQty: parseInt(cleanField(fields[15])) || 1,
      status: cleanField(fields[16]) || 'active',
      category: catMap[cleanField(fields[1])] || null,
      publishedAt: new Date(),
    };

    const created = await instance.entityService.create('api::book.book', { data });

    // Handle Photos
    const frontBlob = decodeSqlBlob(fields[10]);
    if (frontBlob && frontBlob.length > 500) {
      await uploadFile(frontBlob, `front_${created.id}.jpg`, created.id, 'frontCover');
    }

    const backBlob = decodeSqlBlob(fields[11]);
    if (backBlob && backBlob.length > 500) {
      await uploadFile(backBlob, `back_${created.id}.jpg`, created.id, 'backCover');
    }

    bookCount++;
    console.log(`Imported ${bookCount}/6190: ${data.title}`);
  });

  console.log(`TEST Migration completed! ${bookCount} books with photos imported.`);
  process.exit(0);
}

migrate().catch(e => { console.error(e); process.exit(1); });
