const { models: { Server } } = require('../db')

module.exports = {
  name: 'randomtimer',
  adminOnly: true,
  description: 'Sets the time interval for a random battle to occur (in minutes) (up to 60) (default: 30)',
  async execute(Discord, client, message, args, Games, randomMatch) {
    try {
      console.log("Before timer change", randomMatch[message.guildId])
      if (!randomMatch[message.guildId]) return message.reply("You need to set a battle channel first.")
      if (!args[0]) return message.reply("You need to provide a number for the interval")
      if (isNaN(args[0])) return message.reply(`${args[0]} is not a number`)
      if (args[0] < 1 || args[0] > 60) return message.reply("Interval number needs to be between 1 and 60")

      await Server.update({ matchInterval: args[0] }, { where: { serverID: message.guildId } })
      randomMatch[message.guildId].matchInterval = args[0]
      message.reply(`A random match will now occur every ${randomMatch[message.guildId].matchInterval} minute(s)${!randomMatch[message.guildId].active ? '\n**Warning** Random battles are currently off.' : ''}`)
    } catch (error) {
      console.log(error)
      message?.reply("Error: Could not set timer")
    }

  }
}
