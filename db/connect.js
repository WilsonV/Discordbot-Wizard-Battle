const { db } = require('./index')

module.exports = async function init() {
  try {
    await db.sync()
  } catch (error) {
    console.log(error)
    process.exit(1)
  }

}
