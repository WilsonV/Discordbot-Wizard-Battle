const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pings the bot, make sure it is online.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  adminOnly: true,
  execute(Discord, client, interaction) {
    interaction.reply("Pong!")
  }
}
