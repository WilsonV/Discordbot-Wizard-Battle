module.exports = {
  name: 'randomactivetimer',
  adminOnly: true,
  description: 'Sets the time to keep a player active for a random battle (in minutes) (up to 60) (default: 10)',
  execute(Discord, client, message, args, Games, randomMatch) {

    if (!args[0]) return message.reply("You need to provide a number for the timer")
    if (isNaN(args[0])) return message.reply(`${args[0]} is not a number`)
    if (args[0] < 1 || args[0] > 60) return message.reply("Active timer number needs to be between 1 and 60")

    randomMatch.KeepPlayersActive = args[0]
    message.reply(`Players will be kept active for ${randomMatch.KeepPlayersActive} minute(s)${!randomMatch.active ? '\n**Warning** Random battles are currently off.' : ''}`)
  }
}
