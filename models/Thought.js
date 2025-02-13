// Esse será o model do pensamento, o pensamento terá apenas um titulo.

// Ele terá como chave estrangeira o usuário que fez esse pensamento!

const { DataTypes } = require("sequelize");

const dbConnection = require("../db/connection");

// Importando o model do user
const User = require("./User");

const Thought = dbConnection.define("Thought", {
  title: {
    type: DataTypes.STRING,
    required: true,
    allowNull: false,
  },
});

// Um usuário pode ter muitos pensamentos, um pensamento deverá ter um usuário
User.hasMany(Thought);
Thought.belongsTo(User);

module.exports = Thought;
