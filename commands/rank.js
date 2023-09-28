const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { models: { User } } = require('../db')
const getUserStats = require('../Util/userStats')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription("view a user's rankings")
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('user to view')
        .setRequired(true)
    ),
  adminOnly: false,
  async execute(Discord, client, interaction) {
    try {
      const targetedUser = interaction.options.get('user').user;
      const stats = await getUserStats(targetedUser.id)

      const newEmbed = new EmbedBuilder()
        .setTimestamp(Date.now())
        .setColor("#ffffff")
        .setTitle(`${targetedUser.username}'s rank`)
        .setThumbnail(targetedUser.avatarURL())
        .addFields([
          {
            name: "Ranking",
            value: String(stats.rankPoints),
            inline: true
          },
          {
            name: "Wins",
            value: String(stats.wins),
            inline: true
          },
          {
            name: "Losses",
            value: String(stats.losses),
            inline: true
          }
        ])

      interaction.reply({ embeds: [newEmbed] })
    } catch (error) {
      console.log(error)
      interaction?.reply("Error: Could not retrieve rank")
    }
  }
}
