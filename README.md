# etherscan_scrapping

Study project for scraping data from etherscan.io by making a request GET domain.com/transactions/{number} server will return you a number of etherium wallet with biggest amount from the last specified amount of blocks.

---

## Prerequisites

mysql or mariadb installed. NodeJS v.15 installed. Be sure that you obtain etherscan.io API key to be able use all functions of app.

### Database configuration

- #### Create database

  First, you have create database by mysql> CREATE DATABASE {databaseName}. In project database called eth.

- #### Create tables

  Second, you have to create tables in your database. For do this, please do mysql> USE {{databaseName}, and then create tables: for blocks tag, and for transactions. Do CREATE TABLE blocks (tag VARCHAR(8) NOT NULL UNIQUE), and CREATE TABLE transactions (hash VARCHAR(66) UNIQUE NOT NULL from_whom VARCHAR(42) NOT NULL to_whom VARCHAR(42) NOT NULL value VARCHAR(50) NOT NULL)

- #### Create tables

Be sure that you've obtained etherscan.io api key and use it in .env file. You can take .env.sample file as a reference for your .env file.

- #### Install dependancies

  Run

  $ npm install

Command in project folder.

###

## Running the project

Run
$ npm run dev
Command to run project in developing mode with hot reload.

## Test command

Use Postman request and make GET http://localhost:3001/transactions/{number} request to get the result.
