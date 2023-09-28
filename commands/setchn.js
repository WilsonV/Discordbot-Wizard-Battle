const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { models: { Server } } = require('../db')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setchn')
    .setDescription('sets the channel you are in as the place for battles.')
    .addChannelOption(option =>
      option
        .setName('battle-channel')
        .setDescription('channel to use for battles')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  adminOnly: true,
  async execute(Discord, client, interaction, Games, randomMatch, activateTimer) {
    try {
      //console.log("Before Setting:", randomMatch[message.guildId])
      randomMatch[interaction.guildId] = await Server.setBattleChannel({ serverID: interaction.guildId, battleChannel: interaction.channelId })
      randomMatch[interaction.guildId].battleChannel = interaction.channelId
      //add timer if they didnt have one from startup
      if (!randomMatch[interaction.guildId].activePlayerTrackTimer) {
        activateTimer(interaction.guildId)
      }
      interaction.reply("This channel has been set for battles!")
      //console.log("After Setting:", randomMatch[interaction.guildId])
    } catch (error) {
      console.log(error)
      interaction?.reply("Error: Could not set channel for battle")
    }

  }
}
