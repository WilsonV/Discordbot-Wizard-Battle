const Sequelize = require('sequelize')
const db = require('../db')

const User = db.define('user', {
  userID: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  rankPoints: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 500,
    validate: {
      min: 0,
      max: 5000
    }
  },
  wins: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  losses: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
}, { timestamps: false })

module.exports = User
