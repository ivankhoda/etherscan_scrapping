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

} = require('./utils/helpers');

let blocks = [];
function detectWallet(number) {
  const getSpecifiedAmountOfBlocks = setInterval(() => {
    getBlocks(blocks);
    logBlocks(axiosGetBlock, blocks);

    if (blocks.length === number) {
      stopIntervalOf(getSpecifiedAmountOfBlocks);
    }
  }, 2000);

  const checkIfBlocksArrayIsFull = setInterval(() => {
    if (checkIfBlockArrayIsFull(blocks, number)) {
      stopIntervalOf(checkIfBlocksArrayIsFull);
      getBlocksFromDB(number);
      blocks = [];
    }
  }, 2000);
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

  res.end(
    `<h1>Welcome to Etherscan data scrapping and you want to get ${numberOfBlocksToGetTransactions} blocks transactions</h1>`,
  );
});
// Check if server is working
server.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
