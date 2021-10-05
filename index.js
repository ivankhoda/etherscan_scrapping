require('dotenv').config();

const http = require('http');

const {
  logBlocks,
  stopIntervalOf,
  axiosGetBlock,
  getBlocks,
  checkIfBlockArrayIsFull,
  getBlocksFromDB,
  truncateTable,
  getHighestIncomeWalletNumber,
} = require('./utils/helpers');

let blocks = [];

function detectWallet(number) {
  const getSpecifiedAmountOfBlocks = setInterval(() => {
    getBlocks(blocks);
    logBlocks(axiosGetBlock, blocks);

    if (blocks.length === number) {
      stopIntervalOf(getSpecifiedAmountOfBlocks);
    }
  }, 1200);

  const checkIfBlocksArrayIsFull = setInterval(() => {
    if (checkIfBlockArrayIsFull(blocks, number)) {
      stopIntervalOf(checkIfBlocksArrayIsFull);
      getBlocksFromDB();
      blocks = [];
    }
  }, 1200);
}
async function getTheHigherIncomeWalletDatabaseRecord() {
  let databaseRecord = '';
  return getHighestIncomeWalletNumber()
    .then((rows) => {
      databaseRecord = Object.values(JSON.parse(JSON.stringify(rows)));
      return databaseRecord;
    }).then((data) => data[0]);
}
const port = process.env.PORT;
// Set up server
const server = http.createServer((req, res) => {
  const requestUrl = req.url;
  const numberOfBlocksToGetTransactions = Number(requestUrl.split('/transactions/').slice(1));

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  truncateTable('blocks');
  truncateTable('transactions');

  detectWallet(numberOfBlocksToGetTransactions);
  setTimeout(() => {
    let wallet;
    getTheHigherIncomeWalletDatabaseRecord()
      .then((obj) => {
        wallet = obj;

        res.end(
          `<h1>Welcome to Etherscan data scrapping. 
          From ${numberOfBlocksToGetTransactions} blocks there is a biggest income wallet with ${wallet.to_whom} number and with ${wallet.Total_Income} ETH</h1>`,
        );
      });
  }, 23000 * numberOfBlocksToGetTransactions);
});
// Check if server is working
server.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
