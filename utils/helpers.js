const axios = require("axios");
const { databaseConnection } = require("../database/database");
//Log amount of blocks asynchoniusly
let logBlocks = async (func, arr) => {
  await func;
  console.log(arr);
};
//Check if block is unique
function blockIsUnique(arr, elementToCheck) {
  if (arr.find((element) => element.result === elementToCheck.result)) {
    return false;
  }
  return true;
}
function stopIntervalOf(interval) {
  clearInterval(interval);
}
//Convert transaction value to decimal
function transactionValueToDecimal(transactionValue) {
  return parseInt(transactionValue, 16) / Math.pow(10, 18);
}

//get block from API
async function axiosGetBlock() {
  return await axios
    .get(`https://${process.env.HOSTNAME}/api?module=proxy&action=eth_blockNumber&apikey=${process.env.API_KEY}`)
    .then((response) => {
      return response.data;
    });
}
//get blocks from API and collect them to array;
async function getBlocks(arr) {
  axiosGetBlock()
    .then((data) => {
      if (blockIsUnique(arr, data)) {
        arr.push(data);
      }
      return;
    })
    .catch((error) => {
      console.log(error);
    });
}
//Check if array of block is full
function checkIfBlockArrayIsFull(arr, desiredAmount) {
  if (arr.length === desiredAmount) {
    console.log("Block array is FULL");
    let values = [];

    arr.forEach((element) => {
      values.push([element.result]);
      insertBlocksToDb([element.result]);
      //return values;
    });
    console.log(values, "from Check if arr is full");

    return values;
  } else {
    console.log("Block array is not yet full");
  }
}
//insert Blocks to database
let sqlInsertBlocks = "INSERT INTO blocks (tag) VALUES (?)";

function insertBlocksToDb(element) {
  databaseConnection.query(sqlInsertBlocks, element, (err, results, fields) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Row inserted:" + results.affectedRows);
  });
}
//Get blocks from DB

function getBlocksFromDB(amount) {
  databaseConnection.query(
    `SELECT *,  ROW_NUMBER() OVER (order BY tag ) AS num FROM blocks ORDER BY num DESC LIMIT ${amount}`,
    function (err, rows, fields) {
      if (err) throw err;
      let blocksFromDb = [];

      blocksFromDb = Object.values(JSON.parse(JSON.stringify(rows)));
      getTransactionsForEachBlock(blocksFromDb);

      return blocksFromDb;
    }
  );
}

//Get transactions by block
async function getTransactions(blockTag) {
  const urlToGetTransactions = `https://${process.env.HOSTNAME}/api?module=proxy&action=eth_getBlockByNumber&tag=${blockTag}&boolean=true&apikey=${process.env.API_KEY}`;

  return axios.get(urlToGetTransactions).then((response) => {
    return response.data;
  });
}
//Get transactions from each block
function getTransactionsForEachBlock(arr) {
  let transactionsArray = [];
  arr.forEach((element) => {
    getTransactions(element.tag).then((data) => {
      transactionsArray.push(data.result.transactions);
      insertBatchTransactionsToDb(transactionsArray);
    });
  });
}

//Clear database from old records
function truncateTable(tableName) {
  let sqlTruncateTable = `TRUNCATE ${tableName};`;
  databaseConnection.query(sqlTruncateTable, (err, results, fields) => {
    if (err) {
      return console.error(err.message);
    }
    console.log(`${tableName} database truncated`);
  });
}

// Insert transactions to database

function insertTransactionToDb(element) {
  let sqlInsertTransactions = "INSERT INTO transactions (hash, from_whom, to_whom, value) VALUES (?);";
  let elementsToDB = [];
  elementsToDB.push(element);

  databaseConnection.query(sqlInsertTransactions, elementsToDB, (err, results, fields) => {
    if (err) {
      console.log();
      return console.error(err.message);
    }
    console.log("Row inserted:" + results.affectedRows);
  });
}
//Insert batch of transactions
function insertBatchTransactionsToDb(arr) {
  arr.forEach((element) => {
    element.forEach((transaction) => {
      insertTransactionToDb([
        transaction.hash,
        transaction.from,
        transaction.to,
        transactionValueToDecimal(transaction.value),
      ]);
    });
  });
}
//Get highest income wallet number
function getHighestIncomeWalletNumber() {
  const queryToGetHighestIncomeWallet = `SELECT ROW_NUMBER() OVER (order BY hash ) as num, to_whom, SUM(value) AS Total_Income FROM transactions GROUP BY to_whom ORDER BY Total_Income DESC LIMIT 1;`;
  databaseConnection.query(queryToGetHighestIncomeWallet, function (err, rows, fields) {
    if (err) throw err;
    const result = Object.values(JSON.parse(JSON.stringify(rows)));

    console.log(result, "row from helpers");
    return result;
  });
}

//Function to filter transactions which are having 0 value
// function filterTransactions(arr, valueToFilter) {
//   return arr.filter((element) => element.value !== valueToFilter);
// }

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
  insertBatchTransactionsToDb,
  getHighestIncomeWalletNumber,
  truncateTable,
};
