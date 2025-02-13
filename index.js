// Requirindo pacotes necessários
const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const flash = require("express-flash");

// Instanciando express
const app = express();

// Definindo a porta
const port = 3000;

// Setup Handlebars - Template engine
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

// Lendo o body
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

// Session middleware - Configurar a sessao do usuário
app.use(
  session({
    name: "session",
    secret: "nosso_secret",
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      logFn: function () {},
      path: require("path").join(require("os").tmpdir(), "sessions"),
    }),
    cookie: {
      secure: false,
      maxAge: 3600000,
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    },
  })
);

// Configurar as flash messages -> Mensagens de feedback do sistema, se deu certo a insercao do formulario etc.
app.use(flash());

// Configurar arquivos estaticos
app.use(express.static("public"));

// Salvar sessao na resposta para conseguir utilizar a flash message
// Vou criar um middleware que permite que eu de andamento no sistema ou nao dependendo do que eu quise fazer
app.use((req, res, next) => {
  if (req.session.userId) {
    res.locals.session = req.session;
    // Se o usuario nao esteja logado, o if passa em branco e eu sigo normalmente
    // Caso o usuario esteja, eu consigo todas as informacoes dele aqui do backend pro frontend
  }

  next();
});

// Chamar a conexao com o banco
const dbConnection = require("./db/connection");

// Chamando meus models
const Thought = require("./models/Thought");
const User = require("./models/User");

// Chamando minhas rotas
const thoughtsRoutes = require("./routes/thoughtsRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/thoughts", thoughtsRoutes);
app.use("/", authRoutes);

// Importei o controller aqui somente para ter acesso a meu /thoughts pelo / somente tb!!
const ThoughtController = require("./controllers/ThoughtController");

app.get("/", ThoughtController.showThoughts);

dbConnection
  .sync()
  .then(() => app.listen(port))
  .catch((err) => console.log(err));
