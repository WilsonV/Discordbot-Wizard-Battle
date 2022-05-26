const Sequelize = require('sequelize')
const db = require('../db')

const Server = db.define('server', {
  serverID: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  battleChannel: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  active: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  matchInterval: {
    type: Sequelize.INTEGER,
    defaultValue: 30,
    validate: {
      min: 1,
      max: 60,
    }
  },
  keepPlayersActive: {
    type: Sequelize.INTEGER,
    defaultValue: 10,
    validate: {
      min: 1,
      max: 60,
    }
  }
}, { timestamps: false })

Server.setBattleChannel = async function ({ serverID, battleChannel }) {
  try {
    const svr = await this.findOne({ where: { serverID } })
    //if server has not been added to list yet
    if (!svr) {
      await this.create({ serverID, battleChannel })
    } else {
      await svr.update({ battleChannel })
    }

    const newSvr = await this.findOne({ where: { serverID }, attributes: { exclude: ['id'] }, raw: true })
    return newSvr
  } catch (error) {
    console.log(error)
  }

}
module.exports = Server
