import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::reservation.reservation', {
  config: {
    find: {},
    findOne: {},
    create: {},
    update: {},
    delete: {},
  },
});

// To add a custom route in Strapi v5 without breaking the core ones,
// we can also use a custom router file or just define it here if the factory allows.
// However, the cleanest way in v5 for custom endpoints is often a separate route file
// or using the internal routes array.
