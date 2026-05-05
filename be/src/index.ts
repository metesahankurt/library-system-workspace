import type { Core } from '@strapi/strapi';
import bcrypt from 'bcryptjs';
import { seedLibraryData } from './seed';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) { },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedLibrarianRole({ strapi });
    await seedPublicBookPermissions({ strapi });
    await seedRolePermissions({ strapi, roleType: 'authenticated' });
    await seedRolePermissions({ strapi, roleType: 'kutuphaneci' });
    await seedLibraryData({ strapi });
    
    const resCount = await strapi.db.query('api::reservation.reservation').count({});
    strapi.log.info(`📊 Toplam Rezervasyon Sayısı: ${resCount}`);

    if (resCount === 0) {
      const firstBook = await strapi.db.query('api::book.book').findOne({});
      const libUser = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { email: 'kutuphaneci@library.local' } });
      
      if (firstBook && libUser) {
        await strapi.db.query('api::reservation.reservation').create({
          data: {
            book: firstBook.id,
            user: libUser.id,
            status: 'pending',
            reservedAt: new Date().toISOString(),
          }
        });
        strapi.log.info('✅ Test rezervasyonu oluşturuldu.');
      }
    }
  },
};

async function seedRolePermissions({ strapi, roleType }: { strapi: Core.Strapi, roleType: string }) {
  const role = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: roleType },
  });
  if (!role) return;

  const actions = [
    'api::reservation.reservation.create',
    'api::reservation.reservation.find',
    'api::reservation.reservation.findOne',
    'api::reservation.reservation.update',
    'api::reservation.reservation.delete',
    'api::reservation.reservation.fulfill',
    'api::loan.loan.find',
    'api::loan.loan.findOne',
    'api::loan.loan.create',
    'api::loan.loan.update',
    'api::book.book.find',
    'api::book.book.findOne',
    'plugin::users-permissions.user.me',
  ];
  for (const action of actions) {
    const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
      where: { action, role: { id: role.id } },
    });
    if (!existing) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: role.id },
      });
      strapi.log.info(`✅ ${roleType} rolüne izin eklendi: ${action}`);
    }
  }
}

async function seedPublicBookPermissions({ strapi }: { strapi: Core.Strapi }) {
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });
  if (!publicRole) return;

  const actions = [
    'api::book.book.find',
    'api::book.book.findOne',
    'api::category.category.find',
    'plugin::users-permissions.auth.register',
  ];
  for (const action of actions) {
    const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
      where: { action, role: { id: publicRole.id } },
    });
    if (!existing) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: publicRole.id },
      });
      strapi.log.info(`✅ Public rolüne izin eklendi: ${action}`);
    }
  }
}

async function seedLibrarianRole({ strapi }: { strapi: Core.Strapi }) {
  // Fetch existing roles
  const rolesResult = await strapi.db.query('plugin::users-permissions.role').findMany({});

  let librarianRole = rolesResult.find((r: any) => r.type === 'kutuphaneci');

  if (!librarianRole) {
    librarianRole = await strapi.db.query('plugin::users-permissions.role').create({
      data: {
        name: 'Kütüphaneci',
        description: 'Kütüphane yönetim paneline erişebilen kütüphaneci rolü',
        type: 'kutuphaneci',
      },
    });

    strapi.log.info('✅ Kütüphaneci rolü oluşturuldu.');
  } else {
    strapi.log.info('ℹ️  Kütüphaneci rolü zaten mevcut.');
  }

  // Ensure the librarian role can call /api/users/me (required to populate role info)
  const meAction = 'plugin::users-permissions.user.me';
  const existingMePerm = await strapi.db.query('plugin::users-permissions.permission').findOne({
    where: { action: meAction, role: { id: librarianRole.id } },
  });
  if (!existingMePerm) {
    await strapi.db.query('plugin::users-permissions.permission').create({
      data: { action: meAction, role: librarianRole.id },
    });
    strapi.log.info('✅ Kütüphaneci rolüne me permission eklendi.');
  }

  // Check if librarian user exists
  const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
    where: { email: 'kutuphaneci@library.local' },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('Kutuphane#9421!', 10);

    await strapi.db.query('plugin::users-permissions.user').create({
      data: {
        username: 'kutuphaneci',
        email: 'kutuphaneci@library.local',
        password: hashedPassword,
        confirmed: true,
        blocked: false,
        role: librarianRole.id,
        provider: 'local',
      },
    });

    strapi.log.info('✅ Kütüphaneci kullanıcısı oluşturuldu: kutuphaneci@library.local');
  } else {
    strapi.log.info('ℹ️  Kütüphaneci kullanıcısı zaten mevcut.');
  }
}
