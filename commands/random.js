const { models: { Server } } = require('../db')

module.exports = {
  name: 'random',
  adminOnly: true,
  description: 'Turn on/off random battles between active members',
  async execute(Discord, client, message, args, Games, randomMatch) {
    try {
      if (!randomMatch[message.guildId]) return message.reply("You need to set a battle channel first.")

      if (args[0] === 'on') {
        await Server.update({ active: true }, { where: { serverID: message.guildId } })
        randomMatch[message.guildId].active = true
        //**Activate the timer if it isnt already active */

        message.reply(`Random battle turned on`)
      } else if (args[0] === 'off') {
        await Server.update({ active: false }, { where: { serverID: message.guildId } })
        randomMatch[message.guildId].active = false
        message.reply(`Random battle turned off`)
      } else {
        message.reply("You entered a wrong value, try 'on' or 'off'")
      }
    } catch (error) {
      console.log(error)
      message?.reply("Error: Could not turn on/off random battles")
    }


  }
}
