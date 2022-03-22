const axios = require('axios');
const { databaseConnection } = require('../database/database');
// Log amount of blocks asynchoniusly
const logBlocks = async (func, arr) => {
  await func;
  console.log(arr);
};
// Check if block is unique
function blockIsUnique(arr, elementToCheck) {
  if (arr.find((element) => element.result === elementToCheck.result)) {
    return false;
  }
  return true;
}
function stopIntervalOf(interval) {
  clearInterval(interval);
}
// Convert transaction value to decimal
function transactionValueToDecimal(transactionValue) {
  return parseInt(transactionValue, 16) / (10 ** 18);
}

// get block from API
async function axiosGetBlock() {
  return axios
    .get(`https://${process.env.API_URL}/api?module=proxy&action=eth_blockNumber&apikey=${process.env.API_KEY}`)
    .then((response) => response.data);
}
// get blocks from API and collect them to array;
async function getBlocks(arr) {
  axiosGetBlock()
    .then((data) => {
      if (blockIsUnique(arr, data)) {
        arr.push(data);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}
// Check if array of block is full
function checkIfBlockArrayIsFull(arr, desiredAmount) {
  if (arr.length === desiredAmount) {
    console.log('Block array is FULL');
    const values = [];

    arr.forEach((element) => {
      values.push([element.result]);
      insertBlocksToDb([element.result]);
    });
    console.log(values, 'from Check if arr is full');

    return values;
  }
  console.log('Block array is not yet full');
}
// insert Blocks to database
const sqlInsertBlocks = 'INSERT INTO blocks (tag) VALUES (?)';

function insertBlocksToDb(element) {
  databaseConnection.query(sqlInsertBlocks, element, (err, results, fields) => {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row of block inserted:${results.affectedRows}`);
  });
}

function getBlocksFromDB() {
  let blocksFromDb = [];
  databaseConnection.query(
    'SELECT * FROM blocks',
    (err, rows) => {
      if (err) throw err;
      blocksFromDb = Object.values(JSON.parse(JSON.stringify(rows)));
      console.log(blocksFromDb.length);
      getTransactionsForEachBlock(blocksFromDb);
    },
  );
}

// Get transactions by block
async function getTransactions(blockTag) {
  const urlToGetTransactions = `https://${process.env.API_URL}/api?module=proxy&action=eth_getBlockByNumber&tag=${blockTag}&boolean=true&apikey=${process.env.API_KEY}`;

  return axios.get(urlToGetTransactions).then((response) => response.data);
}
// Get transactions from each block
function getTransactionsForEachBlock(arr) {
  arr.forEach((element) => {
    console.log(element, 'tag');
    getTransactions(element.tag).then((data) => {
      if (data.result.transactions !== undefined) {
        data.result.transactions.forEach((transaction) => {
          insertTransactionToDb([
            transaction.hash,
            transaction.from,
            transaction.to,
            transactionValueToDecimal(transaction.value),
          ]);
        });
      } else {
        console.log(data.result.transaction, 'Undefined? transacio');
      }
    });
  });
}

// Clear database from old records
function truncateTable(tableName) {
  const sqlTruncateTable = `TRUNCATE ${tableName};`;
  databaseConnection.query(sqlTruncateTable, (err) => {
    if (err) {
      return err.message;
    }
    return (`${tableName} database truncated`);
  });
}

function insertTransactionToDb(element) {
  const sqlInsertTransactions = 'INSERT INTO transactions (hash, from_whom, to_whom, value) VALUES (?);';
  const elementsToDB = [];
  elementsToDB.push(element);

  databaseConnection.query(sqlInsertTransactions, elementsToDB, (err, results) => {
    if (err) {
      return err.message;
    }
    console.log(`Row of transaction inserted:${results.affectedRows}`);
  });
}

// Get highest income wallet number
function getHighestIncomeWalletNumber() {
  return new Promise((resolve, reject) => {
    const queryToGetHighestIncomeWallet = 'SELECT ROW_NUMBER() OVER (order BY hash ) as num, to_whom, SUM(value) AS Total_Income FROM transactions GROUP BY to_whom ORDER BY Total_Income DESC LIMIT 1;';
    databaseConnection.query(queryToGetHighestIncomeWallet, (err, rows) => {
      if (err) throw reject(err);

      resolve(rows);
    });
  });
}

module.exports = {
  logBlocks,
  blockIsUnique,
  stopIntervalOf,
  transactionValueToDecimal,
  axiosGetBlock,
  getBlocks,
  checkIfBlockArrayIsFull,
  getBlocksFromDB,
  getTransactions,
  insertTransactionToDb,
  getHighestIncomeWalletNumber,
  truncateTable,
};
