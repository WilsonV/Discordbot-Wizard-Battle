const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { models: { Server } } = require('../db')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomtimer')
    .setDescription('Sets the time interval for a random battle to occur (in minutes) (up to 60) (default: 30)')
    .addNumberOption(option =>
      option
        .setName('minutes')
        .setDescription('minutes to keep a player on active list')
        .setMinValue(1)
        .setMaxValue(60)
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  adminOnly: true,
  async execute(Discord, client, interaction, Games, randomMatch) {
    try {
      //console.log("Before timer change", randomMatch[message.guildId])
      if (!randomMatch[interaction.guildId]) return message.reply("You need to set a battle channel first.")
      // if (!args[0]) return message.reply("You need to provide a number for the interval")
      // if (isNaN(args[0])) return message.reply(`${args[0]} is not a number`)
      // if (args[0] < 1 || args[0] > 60) return message.reply("Interval number needs to be between 1 and 60")
      const newRandomTime = interaction.options.get('minutes').value;

      await Server.update({ matchInterval: newRandomTime }, { where: { serverID: interaction.guildId } })
      randomMatch[interaction.guildId].matchInterval = newRandomTime;

      //update task timer
      if (randomMatch[interaction.guildId].activePlayerTrackTimer) {
        randomMatch[interaction.guildId].activePlayerTrackTimer.interval = 60000 * newRandomTime
      }

      interaction.reply(`A random match will now occur every ${randomMatch[interaction.guildId].matchInterval} minute(s)${!randomMatch[interaction.guildId].active ? '\n**Warning** Random battles are currently off.' : ''}`)
    } catch (error) {
      console.log(error)
      interaction?.reply("Error: Could not set timer")
    }

  }
}
