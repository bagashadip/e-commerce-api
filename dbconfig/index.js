const { Client } = require("pg");

const connection = new Client({
  host: "localhost",
  port: 5432,
  user: "bagashadi",
  password: "kamujelek",
  database: "ecommerce_api",
});

connection
  .connect()
  .then(() => console.log("database connected..."))
  .catch((err) => console.log("connection error...", err.stack));

module.exports = connection;
