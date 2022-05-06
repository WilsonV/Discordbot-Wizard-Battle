module.exports = {
  name:'unsetrndbattle',
  adminOnly: true,
  description:'Removes the set channel for random battles (turns off random battles)',
  execute(Discord,client,message, args, Games, randomMatchChannel){
    randomMatchChannel.channel = null
    message.reply("Random battle channel has been removed (random battles is now off)")
  }
}
