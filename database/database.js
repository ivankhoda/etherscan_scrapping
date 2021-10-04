const mysql = require("mysql");

const databaseConfig = require("../config/db.config.js");
//Set up connection with database

const databaseConnection = mysql.createConnection(databaseConfig.databaseOptions);
databaseConnection.connect(function (err) {
  if (err) {
    return console.error("Ошибка: " + err);
  }
  console.log("Подключение к серверу MySQL успешно установлено");
});

module.exports = {
  databaseConnection,
};
