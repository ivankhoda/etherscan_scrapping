require("dotenv").config();

const http = require("http");
const https = require("https");
const url = require("url");
const { databaseConnection } = require("./database/database");

const {
  logBlocks,
  blockIsUnique,
  stopIntervalOf,
  transactionValueToDecimal,
  axiosGetBlock,
  getBlocks,
  checkIfBlockArrayIsFull,
  getBlocksFromDB,
  getHighestIncomeWalletNumber,
  truncateTable,
} = require("./utils/helpers");

const port = process.env.PORT;
//Set up server
let blocks = [];
const server = http.createServer((req, res) => {
  const requestUrl = req.url;
  const numberOfBlocksToGetTransactions = Number(requestUrl.split("/transactions/").slice(1));
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  truncateTable("blocks");
  truncateTable("transactions");

  detectWallet(numberOfBlocksToGetTransactions);

  res.end(
    `<h1>Welcome to Etherscan data scrapping and you want to get ${numberOfBlocksToGetTransactions} blocks transactions</h1>`
  );
});
//Check if server is working
server.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
function detectWallet(number) {
  //return new Promise((resolve, reject) => {
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
  //   resolve();
  // });
}