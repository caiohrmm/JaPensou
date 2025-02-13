// Chamando meus models necessários
const Thought = require("../models/Thought");
const Thoughts = require("../models/Thought");
const User = require("../models/User");

const { Op } = require("sequelize");
// O op é o operador que me permite fazer buscar mais avancadas com sequelize -> LIKE

module.exports = class ThoughtController {
  static async showThoughts(req, res) {
    // Criando funcao de busca
    let search = ""; // Precisa ser let pois sempre irei mudar seu valor.

    if (req.query.search) {
      search = req.query.search;
    }
    // Pega o parametro ?search que é disparado na url

    let order = "DESC";

    if (req.query.order === "old") {
      order = "ASC";
    } else {
      order = "DESC";
    }

    const thoughtsData = await Thought.findAll({
      include: User,
      where: {
        title: { [Op.like]: `%${search}%` },
      },
      order: [["createdAt", order]],
      
      // Se tiver alguma coisa em search, ele me tras os dados filtrados, caso contrario tras normal
    });
    const thoughts = thoughtsData.map((result) => result.get({ plain: true }));

    // Contador de pensamentos, mostrará quantos pensamentos existem no filtro ou no total
    let thoughtsQty = thoughts.length;

    if (thoughtsQty === 0) {
      thoughtsQty = false;
    }

    res.render("thoughts/home", { thoughts, search, thoughtsQty });
  }
  static async dashboard(req, res) {
    // Funcao da minha dashboard, aqui o usuario será capaz de ver e criar seus pensamentos, editá-los e remove-los.
    const userId = req.session.userId;

    const user = await User.findOne({
      where: { id: userId },
      include: Thought,
      plain: true,
    });
    // Esse comando do sequelize faz com que venha o usuario para minha variavel e seus pensamentos junto.

    // Checkar se o usuario existe
    if (!user) {
      res.redirect("/login");
    }

    // Eu conseguiria acessar os pensamentos por meio do user.Thoughts porém nele ainda existem muitas coisas
    // Desnecessarias, entao irei filtrar o array
    const thoughts = user.Thoughts.map((item) => item.dataValues);
    // Eu quero somente o que tem dentro de dataValues, que sao meus dados.

    // Verificar se eu já tenho alguma tarefa ou nao em minha dashboard
    let emptyThoughts = false;

    if (thoughts.length === 0) {
      // Se nao tiver nada no array de thoughts significa que nao tenho nenhum pensamento.
      emptyThoughts = true;
    }

    res.render("thoughts/dashboard", { thoughts, emptyThoughts });
  }
  static async createThought(req, res) {
    res.render("thoughts/create");
  }
  static async createThoughtSave(req, res) {
    // Funcao que faz a insercao dos pensamentos no banco de dados.
    const title = req.body.title;

    if (req.session.userId) {
      const userId = req.session.userId;

      const thought = {
        title,
        UserId: userId,
      };

      try {
        await Thought.create(thought);

        req.flash("messagesuccess", "Pensamento criado com sucesso!");
        req.session.save(() => {
          res.redirect("/thoughts/dashboard");
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  static async deleteThought(req, res) {
    // Funcao de remocao de pensamento
    const userId = req.session.userId;

    try {
      await Thought.destroy({ where: { id: req.body.id, UserId: userId } });
      req.flash("messagesuccess", "Pensamento removido com sucesso!");
      req.session.save(() => {
        res.redirect("/thoughts/dashboard");
      });
    } catch (error) {
      console.log(error);
    }
  }

  static async editThought(req, res) {
    const thought = await Thought.findOne({
      where: { id: req.params.id },
      raw: true,
    });

    res.render("thoughts/edit", { thought });

    console.log(thought);
  }

  static async editThoughtUpdate(req, res) {
    const { title } = req.body;
    const thought = {
      title,
    };
    const UserId = req.session.userId;

    try {
      await Thought.update(thought, { where: { id: req.body.id, UserId } });
      req.flash("messagesuccess", "Pensamento editado com sucesso!");
      req.session.save(() => {
        res.redirect("/thoughts/dashboard");
      });
    } catch (error) {
      console.log(error);
    }
  }
};
