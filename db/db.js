const Sequelize = require('sequelize')

//const databaseName = 'wizard-battle'
let PostgresURL;

const config = {
  logging: false
};

if (process.env.DB_URL) {
  config.dialectOptions = {
    // ssl: {
    //   rejectUnauthorized: false
    // }
  };

  PostgresURL = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}:${process.env.DB_PORT}/${process.env.DB_DATABASE_NAME}`
}

const db = new Sequelize(
  PostgresURL || `postgres://localhost:5432/${process.env.DB_DATABASE_NAME}`, config)
module.exports = db
