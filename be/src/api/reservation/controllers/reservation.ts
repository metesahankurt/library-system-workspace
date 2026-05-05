import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::reservation.reservation', ({ strapi }) => ({
  async create(ctx) {
    const { data } = ctx.request.body;
    if (!ctx.state.user) return ctx.unauthorized('Giriş yapmalısınız.');

    try {
      const book = await strapi.documents('api::book.book').findOne({ documentId: data.book });
      if (!book) return ctx.notFound('Kitap bulunamadı.');

      const reservation = await strapi.db.query('api::reservation.reservation').create({
        data: {
          book: book.id,
          user: ctx.state.user.id,
          status: 'pending',
          reservedAt: new Date().toISOString(),
          immediate: false,
        },
      });
      return { data: reservation };
    } catch (err) {
      return ctx.badRequest('Rezervasyon oluşturulamadı.', { error: err.message });
    }
  },

  // Custom Fulfill Action - Atomically handle lending
  async fulfill(ctx) {
    const { id } = ctx.params; 
    strapi.log.info(`🚀 Fulfill isteği alındı: ${id}`);
    
    try {
      // 1. Find reservation with deep relations using internal service
      const reservation = await strapi.documents('api::reservation.reservation').findOne({
        documentId: id,
        populate: ['book', 'user'],
      });

      if (!reservation) return ctx.notFound('Rezervasyon bulunamadı.');
      if (reservation.status === 'fulfilled') return ctx.badRequest('Bu rezervasyon zaten tamamlanmış.');

      const book = reservation.book;
      const user = reservation.user;

      if (!book || !user) return ctx.badRequest('Rezervasyon verileri eksik (Kitap veya Kullanıcı bulunamadı).');

      // 2. Create Loan
      const loan = await strapi.documents('api::loan.loan').create({
        data: {
          book: book.id, // Relation to book
          user: user.id, // Relation to user
          reservation: reservation.id,
          status: 'active',
          loanedAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        }
      });

      // 3. Update Reservation
      await strapi.documents('api::reservation.reservation').update({
        documentId: id,
        data: { status: 'fulfilled' }
      });

      // 4. Update Book Stock
      await strapi.documents('api::book.book').update({
        documentId: book.documentId,
        data: { availableQty: Math.max(0, (book.availableQty || 0) - 1) }
      });

      return { data: { success: true, loan } };
    } catch (err) {
      strapi.log.error('Fulfillment error:', err);
      return ctx.badRequest('İşlem tamamlanamadı.', { error: err.message });
    }
  }
}));
