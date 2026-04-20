export default (plugin: any) => {
  // Override the `me` controller to always include role info,
  // bypassing sanitization that strips it for custom roles.
  plugin.controllers.user['me'] = async (ctx: any) => {
    const { user: authUser } = ctx.state;

    if (!authUser) {
      return ctx.unauthorized();
    }

    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: authUser.id },
      populate: ['role'],
    });

    if (!user) {
      return ctx.notFound();
    }

    // Strip sensitive fields before sending
    const { password, resetPasswordToken, confirmationToken, ...safeUser } = user;

    return ctx.send(safeUser);
  };

  return plugin;
};
