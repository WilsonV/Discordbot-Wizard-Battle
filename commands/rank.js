const { models: { User } } = require('../db')

async function getUserStats(userDiscordID) {
  try {
    const userData = await User.findOrCreate({ where: { userID: userDiscordID } })
    const { id, userID, ...playerStats } = userData[0].toJSON()
    console.log("Found Player1 Stats as", playerStats)
    return playerStats
  } catch (error) {
    console.log(error)
    return new Error("Failed to get user's stats")
  }

}

module.exports = {
  name: 'rank',
  description: 'View your rankings',
  async execute(Discord, client, message) {
    try {
      const stats = await getUserStats(message.author.id)

      const newEmbed = new Discord.MessageEmbed()
        .setTimestamp(Date.now())
        .setColor("#ffffff")
        .setTitle(`${message.author.username}'s rank`)
        .setThumbnail(message.author.avatarURL())
        .addField("Ranking", String(stats.rankPoints), true)
        .addField("Wins", String(stats.wins), true)
        .addField("Losses", String(stats.losses), true)

      message.reply({ embeds: [newEmbed] })
    } catch (error) {
      console.log(error)
      message?.reply("Error: Could not retrieve rank")
    }
  }
}
