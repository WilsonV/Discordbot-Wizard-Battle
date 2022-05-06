const {characterSheetURL} = require('../GameTemplate')

module.exports = {
  name:'characters',
  adminOnly: false,
  description: 'Displays list of available characters',
  execute(Discord,client,message){
    message.reply(`Available Characters\n${characterSheetURL}`)
  }
}
