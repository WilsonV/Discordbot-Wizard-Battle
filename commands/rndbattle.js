module.exports = {
  name: 'rndbattle',
  adminOnly: true,
  description: 'sets the channel you are in as the place for random battles.',
  execute(Discord,client,message, args, Games, randomMatchChannel){
    randomMatchChannel.channel = message.channel
    message.reply("This channel has been set for random battles!")
  }
}
