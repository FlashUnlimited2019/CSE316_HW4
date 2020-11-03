// var mysql = require("mysql");
// var con = mysql.createConnection({
//     host: "localhost",
//     port: 3306,
//     user: "root",
//     password: "asd123",
//     database: "mydb"
// });

// const express = require("express");
// const app = express();
// const url = require('url');



const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});





















