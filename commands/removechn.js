module.exports = {
  name: 'removechn',
  adminOnly: true,
  description: 'Removes the set channel for battles (turns off random battles)',
  execute(Discord, client, message, args, Games, randomMatchChannel) {
    randomMatchChannel.channel = null
    message.reply("Battle channel has been removed (random battles is now off)")
  }
}
