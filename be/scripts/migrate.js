const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function migrate() {
  console.log('Starting migration...');

  // Initialize Strapi
  const { createStrapi } = require('@strapi/strapi');
  const instance = await createStrapi({ distDir: './dist' }).load();
  global.strapi = instance; // Set global strapi if needed by entityService

  const fileSmall = '/Users/taha/Desktop/library-system-workspace-main/u741904765_kutuphane-2.json';
  const fileLarge = '/Users/taha/Desktop/library-system-workspace-main/u741904765_kutuphane.json';

  const dataSmall = JSON.parse(fs.readFileSync(fileSmall, 'utf8'));

  // 1. Clear existing data
  console.log('Clearing existing data...');
  await instance.db.query('api::loan.loan').deleteMany({});
  await instance.db.query('api::reservation.reservation').deleteMany({});
  await instance.db.query('api::book.book').deleteMany({});
  await instance.db.query('api::category.category').deleteMany({});
  await instance.db.query('api::audit-log.audit-log').deleteMany({});
  // Don't clear users yet to avoid losing admin access if needed, 
  // but we will import new ones. 

  const categoryMap = {}; // old_id -> new_id
  const userMap = {}; // old_id -> new_id
  const bookMap = {}; // old_id -> new_id

  // 2. Import Categories
  console.log('Importing categories...');
  const categoriesTable = dataSmall.find(t => t.name === 'categories');
  if (categoriesTable) {
    for (const cat of categoriesTable.data) {
      const created = await instance.entityService.create('api::category.category', {
        data: {
          name: cat.name,
          description: '', // Source doesn't have it
          publishedAt: new Date(),
        }
      });
      categoryMap[cat.id] = created.id;
    }
  }

  // 3. Import Users
  console.log('Importing users...');
  const usersTable = dataSmall.find(t => t.name === 'users');
  const rolesTable = dataSmall.find(t => t.name === 'roles');
  
  // Mapping roles: admin/librarian -> Kütüphaneci (ID 3), user -> Authenticated (ID 1)
  const roleMapping = {
    '1': 3, // Yönetici -> Kütüphaneci
    '2': 3, // Kütüphaneci -> Kütüphaneci
    '3': 1  // Kullanıcı -> Authenticated
  };

  if (usersTable) {
    for (const u of usersTable.data) {
      try {
        const created = await instance.entityService.create('plugin::users-permissions.user', {
          data: {
            username: u.email.split('@')[0] + '_' + u.id, // Ensure unique username
            email: u.email,
            password: 'Password123!', // Strapi requires password, source has hash which we can't easily use directly for login without custom provider
            role: roleMapping[u.role_id] || 1,
            confirmed: true,
            blocked: u.is_active === '0',
          }
        });
        userMap[u.id] = created.id;
      } catch (err) {
        console.error(`Failed to import user ${u.email}: ${err.message}`);
      }
    }
  }

  // 4. Import Books (Streaming Large File)
  console.log('Importing books (streaming large file)...');
  const rl = readline.createInterface({
    input: fs.createReadStream(fileLarge),
    terminal: false
  });

  let isInsideBooks = false;
  let bookCount = 0;

  for await (const line of rl) {
    if (line.includes('"name":"books"')) {
      isInsideBooks = true;
      continue;
    }
    if (isInsideBooks && line.trim().startsWith('{')) {
      let jsonStr = line.trim();
      if (jsonStr.endsWith(',')) jsonStr = jsonStr.slice(0, -1);
      if (jsonStr.endsWith(']')) {
         isInsideBooks = false;
         continue;
      }
      
      try {
        const b = JSON.parse(jsonStr);
        const created = await instance.entityService.create('api::book.book', {
          data: {
            title: b.title,
            author: b.author,
            publisher: b.publisher,
            publishYear: parseInt(b.publish_year) || null,
            isbn: b.isbn,
            bookCode: b.book_code,
            barcodeNumber: b.barcode_number,
            barcodeImage: b.barcode_image,
            description: b.description,
            pageCount: parseInt(b.page_count) || null,
            quantity: parseInt(b.quantity) || 1,
            availableQty: parseInt(b.available_qty) || 1,
            status: b.status || 'active',
            category: categoryMap[b.category_id] || null,
            publishedAt: new Date(),
          }
        });
        bookMap[b.id] = created.id;
        bookCount++;
        if (bookCount % 100 === 0) console.log(`Imported ${bookCount} books...`);
      } catch (err) {
        // console.error('Failed to parse/import book line', err.message);
      }
    }
    if (isInsideBooks && line.trim() === ']') {
      isInsideBooks = false;
    }
  }

  // 5. Import Loans
  console.log('Importing loans...');
  const loansTable = dataSmall.find(t => t.name === 'loans');
  if (loansTable) {
    for (const l of loansTable.data) {
      if (bookMap[l.book_id] && userMap[l.user_id]) {
        await instance.entityService.create('api::loan.loan', {
          data: {
            book: bookMap[l.book_id],
            user: userMap[l.user_id],
            loanDate: l.loan_date,
            returnDate: l.return_date,
            actualReturnDate: l.actual_return_date,
            status: l.status,
            publishedAt: new Date(),
          }
        });
      }
    }
  }

  // 6. Import Reservations
  console.log('Importing reservations...');
  const reservationsTable = dataSmall.find(t => t.name === 'reservations');
  if (reservationsTable) {
    for (const r of reservationsTable.data) {
      if (bookMap[r.book_id] && userMap[r.user_id]) {
        await instance.entityService.create('api::reservation.reservation', {
          data: {
            book: bookMap[r.book_id],
            user: userMap[r.user_id],
            status: r.status || 'pending',
            publishedAt: new Date(),
          }
        });
      }
    }
  }

  console.log('Migration completed successfully!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
