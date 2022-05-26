const { models: { Server } } = require('../db')

module.exports = {
  name: 'setchn',
  adminOnly: true,
  description: 'sets the channel you are in as the place for battles.',
  async execute(Discord, client, message, args, Games, randomMatch, activateTimer) {
    try {
      //console.log("Before Setting:", randomMatch[message.guildId])
      randomMatch[message.guildId] = await Server.setBattleChannel({ serverID: message.guildId, battleChannel: message.channelId })
      randomMatch[message.guildId].battleChannel = message.channelId
      //add timer if they didnt have one from startup
      if (!randomMatch[message.guildId].activePlayerTrackTimer) {
        activateTimer(message.guildId)
      }
      message.reply("This channel has been set for battles!")
      //console.log("After Setting:", randomMatch[message.guildId])
    } catch (error) {
      console.log(error)
      message?.reply("Error: Could not set channel for battle")
    }

  }
}
