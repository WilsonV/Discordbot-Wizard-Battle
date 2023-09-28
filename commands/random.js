const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { models: { Server } } = require('../db')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('Turn on/off random battles between active members')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(option =>
      option
        .setName('true-false')
        .setDescription('set random battles on or off')
        .setRequired(true)),
  name: 'random',
  adminOnly: true,
  async execute(Discord, client, interaction, Games, randomMatch) {
    try {
      if (!randomMatch[interaction.guildId]) return interaction.reply("You need to set a battle channel first with  'setchn'. If you already did, than check this Bots permissions.")
      if (!randomMatch[interaction.guildId].battleChannel) return interaction.reply("You need to set a battle channel first with  'setchn'.")

      if (interaction.options.get('true-false').value === true) {
        await Server.update({ active: true }, { where: { serverID: interaction.guildId } })
        randomMatch[interaction.guildId].active = true
        //**Activate the timer if it isnt already active */

        message.reply(`Random battle turned on`)
      } else if (interaction.options.get('true-false').value === false) {
        await Server.update({ active: false }, { where: { serverID: interaction.guildId } })
        randomMatch[interaction.guildId].active = false
        interaction.reply(`Random battle turned off`)
      } else {
        interaction.reply("You entered a wrong value, try 'on' or 'off'")
      }
    } catch (error) {
      console.log(error)
      interaction?.reply("Error: Could not turn on/off random battles")
    }


  }
}
