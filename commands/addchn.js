module.exports = {
  name: 'addchn',
  adminOnly: true,
  description: 'sets the channel you are in as the place for battles.',
  execute(Discord, client, message, args, Games, randomMatchChannel) {
    randomMatchChannel.channel = message.channel
    message.reply("This channel has been set for battles!")
  }
}
