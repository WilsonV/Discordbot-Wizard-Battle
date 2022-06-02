const db = require('./db')
const Server = require('./models/Server')
const User = require('./models/User')

//set up relationships here if needed

module.exports = {
  db,
  models: {
    Server,
    User
  }
}
