const User = require("../models/User"); // Chamo o usuario para salva-lo no banco

const bcrypt = require("bcryptjs"); // Para mandar as senhas ja criptografadas para o banco

module.exports = class AuthController {
  static login(req, res) {
    res.render("auth/login");
  }
  static register(req, res) {
    res.render("auth/register");
  }
  static async registerPost(req, res) {
    // Primeiro as validacoes
    const { username, email, password, confirmpassword } = req.body;

    // Verificar se a senha colocada é igual a confirmada!
    if (password != confirmpassword) {
      // Enviar mensagem de erro para meu front
      req.flash("message", "As senhas não são iguais. Tente novamente!");

      res.render("auth/register");

      return;
    }

    // Verificar se o email que será registrado já existe no banco
    const checkEmail = await User.findOne({ where: { email } });

    if (checkEmail) {
      // Se tiver algo dentro desse checkEmail ele cai aqui no if
      req.flash("message", "O e-mail já está em uso. Tente novamente!");

      res.render("auth/register");

      return;
    }

    // Criar minha senha criptografada
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = {
      name: username,
      email,
      password: hashedPassword,
    };
    try {
      const createUser = await User.create(user);

      // Agora preciso autenticá-lo na minha sessao
      req.session.userId = createUser.id;

      req.flash("messagesuccess", "Usuário cadastrado com sucesso!");

      req.session.save(() => {
        // Com isso, eu consigo salvar minha sessao e ver se o usuario está autenticado ou nao no meu frontend
        res.redirect("/");
      });
    } catch (error) {
      console.log(error);
    }
  }
  static logout(req, res) {
    // Irei destruir a sessao do usuário e redirecionar para a tela de login
    req.session.destroy();
    res.redirect("/login");
  }

  static async loginPost(req, res) {
    // Funcao que faz a autenticacao do usuario no login
    const { email, password } = req.body;

    // Verificar se o usuario existe
    const user = await User.findOne({ where: { email }, raw: true });

    if (!user) {
      req.flash(
        "message",
        "Esse e-mail não existe em nosso sistema. Tente novamente!"
      );

      res.render("auth/login");

      return;
    }

    // Verificar se a senha consta com a registrada no sistema
    const passwordMatch = bcrypt.compareSync(password, user.password); // Retorna true ou false

    if (!passwordMatch) {
      req.flash("message", "Senha incorreta. Tente novamente!");

      res.render("auth/login");

      return;
    }

    // Se ele passou por todas as validacoes, agora eu logo ele!

    // Agora preciso autenticá-lo na minha sessao
    req.session.userId = user.id;

    req.flash("messagesuccess", "Login realizado com sucesso!");

    req.session.save(() => {
      // Com isso, eu consigo salvar minha sessao e ver se o usuario está autenticado ou nao no meu frontend
      res.redirect("/");
    });
  }
  catch(error) {
    console.log(error);
  }
};
