export default {
  routes: [
    {
      method: 'POST',
      path: '/reservations/:id/fulfill',
      handler: 'api::reservation.reservation.fulfill',
      config: {
        auth: false, // We'll handle permission via the bootstrap seed as usual
      },
    },
  ],
};
