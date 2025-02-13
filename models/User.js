const { DataTypes } = require("sequelize");

const dbConnection = require("../db/connection");

const User = dbConnection.define("User", {
  name: {
    type: DataTypes.STRING,
    required: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    required: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    required: true,
    allowNull: false,
  },
});

module.exports = User
