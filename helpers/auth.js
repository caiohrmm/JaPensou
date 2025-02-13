// Precisarei de um middleware que verificará se o usuário está logado ou nao para continuar a mexer no sistema.

module.exports.checkAuth = function (req, res, next) {
  const userId = req.session.userId;

  if (!userId) {
    res.redirect("/login");
  } else {
    next();
  }

  // Se nao existir sessao, ele redireciona para o login, caso exista ele deixa eu continuar
};
