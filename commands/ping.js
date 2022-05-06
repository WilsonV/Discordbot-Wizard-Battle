module.exports = {
  name: 'ping',
  description: 'Pings the bot, make sure it is online.',
  execute(Discord,client,message){
    message.reply("Pong!")
  }
}
