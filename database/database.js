const mysql = require('mysql');

const databaseConfig = require('../config/db.config');
// Set up connection with database

const databaseConnection = mysql.createConnection(databaseConfig.databaseOptions);
databaseConnection.connect((err) => {
  if (err) {
    return console.error(`Ошибка: ${err}`);
  }
  console.log('Подключение к серверу MySQL успешно установлено');
});

module.exports = {
  databaseConnection,
};
