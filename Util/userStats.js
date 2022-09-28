const User = require("../db/models/User")

async function getUserStats(userDiscordID) {
  try {
    const userData = await User.findOrCreate({ where: { userID: userDiscordID } })
    const { id, userID, ...playerStats } = userData[0].toJSON()
    console.log("Found Player Stats for user", userDiscordID, "as", playerStats)
    return playerStats
  } catch (error) {
    console.log(error)
    return new Error("Failed to get user's stats")
  }

}

module.exports = getUserStats
