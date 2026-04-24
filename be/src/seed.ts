import type { Core } from '@strapi/strapi';

/**
 * Kütüphane başlangıç verilerini PostgreSQL'e yükler.
 * Strapi bootstrap'ından çağrılır; veriler zaten mevcutsa tekrar eklenmez.
 */
export async function seedLibraryData({ strapi }: { strapi: Core.Strapi }) {
  // Zaten veri varsa çık
  const existing = await strapi.db.query('api::book.book').count({});
  if (existing > 0) {
    strapi.log.info(`ℹ️  Seed atlandı — ${existing} kitap zaten mevcut.`);
    return;
  }

  strapi.log.info('🌱 Kütüphane seed verisi yükleniyor...');

  // ── 1. KATEGORİLER ────────────────────────────────────────────────────────
  const categoryData = [
    { name: 'Roman',         description: 'Yerli ve yabancı roman eserleri' },
    { name: 'Tarih',         description: 'Tarih, biyografi ve anı kitapları' },
    { name: 'Bilim',         description: 'Doğa bilimleri ve popüler bilim' },
    { name: 'Felsefe',       description: 'Felsefe ve düşünce tarihi' },
    { name: 'Teknoloji',     description: 'Bilgisayar, yazılım ve mühendislik' },
    { name: 'Sanat',         description: 'Resim, müzik, sinema ve tasarım' },
    { name: 'Psikoloji',     description: 'Psikoloji ve kişisel gelişim' },
    { name: 'Çocuk',         description: 'Çocuk ve gençlik edebiyatı' },
    { name: 'Hukuk',         description: 'Hukuk, siyaset ve sosyal bilimler' },
    { name: 'Ekonomi',       description: 'Ekonomi, finans ve iş dünyası' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoryData) {
    const created = await strapi.db.query('api::category.category').create({ data: cat });
    categories[cat.name] = created;
    strapi.log.info(`  ✔ Kategori: ${cat.name}`);
  }

  // ── 2. KİTAPLAR ───────────────────────────────────────────────────────────
  const booksData = [
    // Roman
    {
      title: 'İnce Memed',           author: 'Yaşar Kemal',       publisher: 'YKY',
      publishYear: 1955, isbn: '9789750808029', bookCode: 'ROM-001',
      barcodeNumber: '8690000000001', description: 'Türk edebiyatının başyapıtlarından biri.',
      pageCount: 456, quantity: 3, availableQty: 3, status: 'active', category: 'Roman',
    },
    {
      title: 'Tutunamayanlar',        author: 'Oğuz Atay',         publisher: 'İletişim',
      publishYear: 1972, isbn: '9789754701456', bookCode: 'ROM-002',
      barcodeNumber: '8690000000002', description: 'Türk postmodern edebiyatının köşe taşı.',
      pageCount: 724, quantity: 2, availableQty: 2, status: 'active', category: 'Roman',
    },
    {
      title: 'Suç ve Ceza',           author: 'Fyodor Dostoyevski', publisher: 'İş Bankası',
      publishYear: 1866, isbn: '9789752959391', bookCode: 'ROM-003',
      barcodeNumber: '8690000000003', description: 'Rus edebiyatının şaheseri.',
      pageCount: 687, quantity: 4, availableQty: 4, status: 'active', category: 'Roman',
    },
    {
      title: 'Yüzyıllık Yalnızlık',   author: 'Gabriel García Márquez', publisher: 'Can',
      publishYear: 1967, isbn: '9789750718915', bookCode: 'ROM-004',
      barcodeNumber: '8690000000004', description: 'Sihirsel gerçekçiliğin zirvesi.',
      pageCount: 417, quantity: 3, availableQty: 3, status: 'active', category: 'Roman',
    },
    {
      title: 'Kar',                   author: 'Orhan Pamuk',        publisher: 'YKY',
      publishYear: 2002, isbn: '9789750806728', bookCode: 'ROM-005',
      barcodeNumber: '8690000000005', description: 'Nobel ödüllü Türk yazarın başyapıtı.',
      pageCount: 479, quantity: 5, availableQty: 5, status: 'active', category: 'Roman',
    },
    // Tarih
    {
      title: 'Osmanlı İmparatorluğu\'nun Çöküşü', author: 'Lord Kinross', publisher: 'Altın Kitaplar',
      publishYear: 1977, isbn: '9789752108356', bookCode: 'TAR-001',
      barcodeNumber: '8690000000006', description: 'Osmanlı tarihinin kapsamlı analizi.',
      pageCount: 672, quantity: 2, availableQty: 2, status: 'active', category: 'Tarih',
    },
    {
      title: 'Atatürk',               author: 'Andrew Mango',       publisher: 'Remzi',
      publishYear: 1999, isbn: '9789751408785', bookCode: 'TAR-002',
      barcodeNumber: '8690000000007', description: 'Atatürk\'ün kapsamlı biyografisi.',
      pageCount: 688, quantity: 3, availableQty: 3, status: 'active', category: 'Tarih',
    },
    {
      title: 'Sapiens',               author: 'Yuval Noah Harari',  publisher: 'Kolektif',
      publishYear: 2011, isbn: '9786050814842', bookCode: 'TAR-003',
      barcodeNumber: '8690000000008', description: 'İnsanlığın kısa tarihi.',
      pageCount: 511, quantity: 6, availableQty: 6, status: 'active', category: 'Tarih',
    },
    // Bilim
    {
      title: 'Kısa Bir Evren Tarihi', author: 'Stephen Hawking',    publisher: 'Alfa',
      publishYear: 1988, isbn: '9786053754954', bookCode: 'BIL-001',
      barcodeNumber: '8690000000009', description: 'Evren ve zamanın sırlarına yolculuk.',
      pageCount: 256, quantity: 4, availableQty: 4, status: 'active', category: 'Bilim',
    },
    {
      title: 'Kozmos',                author: 'Carl Sagan',          publisher: 'TÜBİTAK',
      publishYear: 1980, isbn: '9789754033243', bookCode: 'BIL-002',
      barcodeNumber: '8690000000010', description: 'Evrenin büyüleyici yolculuğu.',
      pageCount: 449, quantity: 3, availableQty: 3, status: 'active', category: 'Bilim',
    },
    // Felsefe
    {
      title: 'Sofie\'nin Dünyası',    author: 'Jostein Gaarder',    publisher: 'Pan',
      publishYear: 1991, isbn: '9789757652496', bookCode: 'FEL-001',
      barcodeNumber: '8690000000011', description: 'Felsefe tarihine romanla giriş.',
      pageCount: 508, quantity: 4, availableQty: 4, status: 'active', category: 'Felsefe',
    },
    {
      title: 'Nikomakhos\'a Etik',    author: 'Aristoteles',         publisher: 'Bilgesu',
      publishYear: -350, isbn: '9786055943080', bookCode: 'FEL-002',
      barcodeNumber: '8690000000012', description: 'Etik felsefesinin temel eseri.',
      pageCount: 312, quantity: 2, availableQty: 2, status: 'active', category: 'Felsefe',
    },
    // Teknoloji
    {
      title: 'Temiz Kod',             author: 'Robert C. Martin',   publisher: 'Dikeyeksen',
      publishYear: 2008, isbn: '9786053219583', bookCode: 'TEK-001',
      barcodeNumber: '8690000000013', description: 'Yazılım geliştirme en iyi pratikleri.',
      pageCount: 431, quantity: 3, availableQty: 3, status: 'active', category: 'Teknoloji',
    },
    {
      title: 'Yapay Zeka: Modern Bir Yaklaşım', author: 'Stuart Russell', publisher: 'Nobel',
      publishYear: 2020, isbn: '9786053366645', bookCode: 'TEK-002',
      barcodeNumber: '8690000000014', description: 'Yapay zeka alanının standart başvuru kitabı.',
      pageCount: 1132, quantity: 2, availableQty: 2, status: 'active', category: 'Teknoloji',
    },
    // Psikoloji
    {
      title: 'Dönüşüm',               author: 'Franz Kafka',         publisher: 'Can',
      publishYear: 1915, isbn: '9789750718854', bookCode: 'PSI-001',
      barcodeNumber: '8690000000015', description: 'Yabancılaşmanın simgesi haline gelen kısa roman.',
      pageCount: 96, quantity: 5, availableQty: 5, status: 'active', category: 'Psikoloji',
    },
    {
      title: 'İnsanı Arayan İnsan',   author: 'Viktor Frankl',       publisher: 'Okuyan Us',
      publishYear: 1946, isbn: '9786055549411', bookCode: 'PSI-002',
      barcodeNumber: '8690000000016', description: 'Anlam arayışının güçlü anlatısı.',
      pageCount: 186, quantity: 4, availableQty: 4, status: 'active', category: 'Psikoloji',
    },
    // Çocuk
    {
      title: 'Küçük Prens',           author: 'Antoine de Saint-Exupéry', publisher: 'Can',
      publishYear: 1943, isbn: '9789750730603', bookCode: 'COC-001',
      barcodeNumber: '8690000000017', description: 'Tüm çağların en çok sevilen çocuk klasiği.',
      pageCount: 96, quantity: 8, availableQty: 8, status: 'active', category: 'Çocuk',
    },
    // Ekonomi
    {
      title: 'Ulusların Zenginliği',  author: 'Adam Smith',          publisher: 'İş Bankası',
      publishYear: 1776, isbn: '9786053602477', bookCode: 'EKO-001',
      barcodeNumber: '8690000000018', description: 'Modern ekonominin kurucu eseri.',
      pageCount: 1152, quantity: 2, availableQty: 2, status: 'active', category: 'Ekonomi',
    },
    {
      title: 'Hızlı ve Yavaş Düşünme', author: 'Daniel Kahneman',   publisher: 'Varlık',
      publishYear: 2011, isbn: '9789753434881', bookCode: 'EKO-002',
      barcodeNumber: '8690000000019', description: 'Davranışsal ekonominin başucu kitabı.',
      pageCount: 512, quantity: 3, availableQty: 3, status: 'active', category: 'Ekonomi',
    },
    // Sanat
    {
      title: 'Sanatın Öyküsü',        author: 'E.H. Gombrich',       publisher: 'Remzi',
      publishYear: 1950, isbn: '9789751413031', bookCode: 'SAR-001',
      barcodeNumber: '8690000000020', description: 'Sanat tarihinin en kapsamlı rehberi.',
      pageCount: 688, quantity: 2, availableQty: 2, status: 'active', category: 'Sanat',
    },
  ];

  const books: any[] = [];
  for (const { category: catName, ...bookFields } of booksData) {
    const cat = categories[catName];
    const book = await strapi.db.query('api::book.book').create({
      data: {
        ...bookFields,
        category: cat?.id ?? null,
      },
    });
    books.push(book);
    strapi.log.info(`  ✔ Kitap: ${bookFields.title}`);
  }

  // ── 3. KÜTÜPHANECİ KULLANICISINI BUL ─────────────────────────────────────
  const libUser = await strapi.db.query('plugin::users-permissions.user').findOne({
    where: { email: 'kutuphaneci@library.local' },
  });

  if (!libUser) {
    strapi.log.warn('⚠️  Kütüphaneci kullanıcısı bulunamadı, ödünç/rezervasyon seed\'i atlandı.');
    strapi.log.info('✅ Seed tamamlandı (kitaplar ve kategoriler yüklendi).');
    return;
  }

  // ── 4. AKTİF ÖDÜNÇLER ─────────────────────────────────────────────────────
  const now = new Date();
  const loanSamples = [
    { bookIdx: 0,  daysAgo: 5,  dueDays: 9  },
    { bookIdx: 2,  daysAgo: 12, dueDays: 2  },
    { bookIdx: 8,  daysAgo: 3,  dueDays: 11 },
    { bookIdx: 11, daysAgo: 20, dueDays: -6 }, // gecikmiş
    { bookIdx: 14, daysAgo: 1,  dueDays: 13 },
  ];

  for (const { bookIdx, daysAgo, dueDays } of loanSamples) {
    const loanedAt = new Date(now); loanedAt.setDate(now.getDate() - daysAgo);
    const dueDate  = new Date(now); dueDate.setDate(now.getDate() + dueDays);
    const isOverdue = dueDays < 0;

    await strapi.db.query('api::loan.loan').create({
      data: {
        book:     books[bookIdx].id,
        user:     libUser.id,
        status:   isOverdue ? 'overdue' : 'active',
        loanedAt,
        dueDate,
        notes: isOverdue ? 'İade tarihi geçti.' : null,
      },
    });
  }
  strapi.log.info('  ✔ 5 ödünç kaydı oluşturuldu.');

  // ── 5. REZERVASYONLAR ──────────────────────────────────────────────────────
  const resSamples = [
    { bookIdx: 1,  exDays: 7  },
    { bookIdx: 6,  exDays: 5  },
    { bookIdx: 16, exDays: 10 },
  ];

  for (const { bookIdx, exDays } of resSamples) {
    const reservedAt = new Date(now);
    const expiresAt  = new Date(now); expiresAt.setDate(now.getDate() + exDays);

    await strapi.db.query('api::reservation.reservation').create({
      data: {
        book:       books[bookIdx].id,
        user:       libUser.id,
        immediate:  false,
        status:     'pending',
        reservedAt,
        expiresAt,
      },
    });
  }
  strapi.log.info('  ✔ 3 rezervasyon kaydı oluşturuldu.');

  // ── 6. DENETİM KAYITLARI ──────────────────────────────────────────────────
  await strapi.db.query('api::audit-log.audit-log').create({
    data: {
      action:    'SEED',
      entity:    'system',
      entityId:  0,
      newData:   { message: 'Başlangıç seed verisi yüklendi.' },
      ipAddress: '127.0.0.1',
      userAgent: 'strapi-bootstrap',
      user:      libUser.id,
    },
  });
  strapi.log.info('  ✔ Denetim kaydı oluşturuldu.');

  strapi.log.info(`✅ Seed tamamlandı — ${books.length} kitap, ${Object.keys(categories).length} kategori, 5 ödünç, 3 rezervasyon.`);
}
