module.exports = {
  name: 'randomtimer',
  adminOnly: true,
  description: 'Sets the time interval for a random battle to occur (in minutes) (up to 60) (default: 30)',
  execute(Discord, client, message, args, Games, randomMatch) {

    if (!args[0]) return message.reply("You need to provide a number for the interval")
    if (isNaN(args[0])) return message.reply(`${args[0]} is not a number`)
    if (args[0] < 1 || args[0] > 60) return message.reply("Interval number needs to be between 1 and 60")

    randomMatch.MatchInterval = args[0]
    message.reply(`A random match will now occur every ${randomMatch.MatchInterval} minute(s)${!randomMatch.active ? '\n**Warning** Random battles are currently off.' : ''}`)
  }
}
