const { characterSheetURL } = require('../GameTemplate')

module.exports = {
  name: 'characters',
  adminOnly: false,
  description: 'Displays list of available characters',
  async execute(Discord, client, message) {
    await message.reply(`Available Characters\n${characterSheetURL}`)
  }
}
