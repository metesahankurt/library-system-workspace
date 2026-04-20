import type { Core } from '@strapi/strapi';
import bcrypt from 'bcryptjs';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedLibrarianRole({ strapi });
  },
};

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
