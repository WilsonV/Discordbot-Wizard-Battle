const db = require('./db')
const Server = require('./models/Server')

//set up relationships here if needed

module.exports = {
  db,
  models: {
    Server
  }
}
