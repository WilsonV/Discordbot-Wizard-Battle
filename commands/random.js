module.exports = {
  name: 'random',
  adminOnly: true,
  description: 'Turn on/off random battles between active members',
  execute(Discord, client, message, args, Games, randomMatch) {
    if (!randomMatch.channel) return message.reply("You need to set a battle channel before setting random")

    if (args[0] === 'on') {
      randomMatch.active = true
      message.reply(`Random battle turned on`)
    } else if (args[0] === 'off') {
      randomMatch.active = false
      message.reply(`Random battle turned off`)
    } else {
      message.reply("You entered a wrong value, try 'on' or 'off'")
    }

  }
}
