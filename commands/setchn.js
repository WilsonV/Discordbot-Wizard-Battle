const { models: { Server } } = require('../db')

module.exports = {
  name: 'setchn',
  adminOnly: true,
  description: 'sets the channel you are in as the place for battles.',
  async execute(Discord, client, message, args, Games, randomMatch) {
    try {
      console.log("Before Setting:", randomMatch[message.guildId])
      randomMatch[message.guildId] = await Server.setBattleChannel({ serverID: message.guildId, battleChannel: message.channelId })
      randomMatch[message.guildId].battleChannel = message.channelId
      message.reply("This channel has been set for battles!")
      console.log("After Setting:", randomMatch[message.guildId])
    } catch (error) {
      console.log(error)
      message?.reply("Error: Could not set channel for battle")
    }

  }
}
