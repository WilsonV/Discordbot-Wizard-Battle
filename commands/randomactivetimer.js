const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { models: { Server } } = require('../db')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomactivetimer')
    .setDescription('Sets the time to keep a player active for a random battle (in minutes) (up to 60) (default: 10)')
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
      if (!randomMatch[interaction.guildId]) return interaction.reply("You need to set a battle channel first.")
      // if (!args[0]) return interaction.reply("You need to provide a number for the timer")
      // if (isNaN(args[0])) return interaction.reply(`${args[0]} is not a number`)
      // if (args[0] < 1 || args[0] > 60) return interaction.reply("Active timer number needs to be between 1 and 60")
      const newActiveTime = interaction.options.get('minutes').value;

      await Server.update({ keepPlayersActive: args[0] }, { where: { serverID: interaction.guildId } })
      randomMatch[interaction.guildId].keepPlayersActive = newActiveTime
      interaction.reply(`Players will be kept active for ${randomMatch[interaction.guildId].keepPlayersActive} minute(s)${!randomMatch[interaction.guildId].active ? '\n**Warning** Random battles are currently off.' : ''}`)
    } catch (error) {
      console.log(error)
      interaction?.reply("Error: Could not set active timer")
    }

  }
}
