const GameStatus = require("../GameStatus")
const GameTemplate = require("../GameTemplate")
const getUserStats = require('../Util/userStats')
const BattleBetweenUsers = require('../Util/userBattle');

module.exports = {
  name: 'challenge',
  description: 'challenge a player to a battle!',
  async execute(Discord, client, message, args, Games, randomMatch) {
    try {
      //console.log("Starting challenge...")
      //Prevent wrong channel challenges
      if (!randomMatch[message.guildId]) return message.reply("A battle channel has not be set, get an admin to set one")
      if (message.channelId !== randomMatch[message.guildId].battleChannel) return message.reply(`This is not where you challenge people, try ${message.guild.channels.cache.get(randomMatch[message.guildId].battleChannel).toString()}`)

      if (message.channel.isThread()) return message.reply("You can't challenge someone inside a thread.")
      if (message.mentions.users.size < 1) return message.reply("Challenge Who? Mention a person to challenge!")
      if (message.mentions.users.first().bot) return message.reply("You can't challenge a bot silly.")
      let userToChallenge = message.mentions.users.first().id
      let challenger = message.author.id

      if (userToChallenge == challenger) return message.reply("Can't challenge yourself.")

      const player1Stats = await getUserStats(challenger)
      const player2Stats = await getUserStats(userToChallenge)

      BattleBetweenUsers(challenger, userToChallenge, randomMatch[message.guildId], Games, Discord, client, player1Stats, player2Stats)
    } catch (error) {
      message.reply('Failed to initiate challenge')
      console.log(error)
    }
  }
  // async execute(Discord, client, message, args, Games, randomMatch) {
  //   try {
  //     if (!randomMatch[message.guildId]) return message.reply("A battle channel has not be set, get an admin to set one")
  //     if (message.channelId !== randomMatch[message.guildId].battleChannel) return message.reply(`This is not where you challenge people, try ${message.guild.channels.cache.get(randomMatch[message.guildId].battleChannel).toString()}`)
  //     if (message.channel.isThread()) return message.reply("You can't challenge someone inside a thread.")
  //     if (message.mentions.users.size < 1) return message.reply("Challenge Who? Mention a person to challenge!")
  //     let userToChallenge = message.mentions.users.first()

  //     //check to see if there is a challenge already exist
  //     const alreadyExistGame = Games[`${message.author.username} VS. ${userToChallenge.username}`]
  //     if (alreadyExistGame && alreadyExistGame.status !== GameStatus.COMPLETED) {
  //       return message.reply('You already have a game in progress with this person')
  //     }

  //     console.log("Starting challenge...")
  //     const gameName = `${message.author.username} VS. ${userToChallenge.username}`
  //     const newThread = await message.channel.threads.create({
  //       name: gameName,
  //       autoArchiveDuration: 60,
  //       reason: 'Private Battle!',
  //     })


  //     //console.log(newThread)

  //     Games[gameName] = Object.create(GameTemplate)
  //     Games[gameName].thread = newThread
  //     await Games[gameName].setPlayers(client, message.author.id, userToChallenge.id)
  //     //console.log(Games[gameName])

  //     //Add members to thread
  //     Games[gameName].addPlayersToThread()

  //     //Message player 2 to come accept
  //     await Games[gameName].thread.send(`<@${Games[gameName].player2.id}>, you have been challenged by <@${Games[gameName].player1.id}>.
  //    \n Do you accept? (yes or no)`)

  //     //Create collector to wait for response
  //     const collector = Games[gameName].thread.createMessageCollector({ filter: (m) => m.author.id === Games[gameName].player2.id, time: 60000 * 2 })

  //     collector.on('collect', async (msg) => {
  //       const response = msg.content.toLowerCase()
  //       //console.log('got a response from player (waiting for accept)')
  //       if (response.startsWith('yes')) {

  //         await msg.channel.send(`${msg.author.username} has accepted the battle!`)
  //         Games[gameName].status = GameStatus.PLAYER1_CHAR_SELECT
  //         Games[gameName].playGame(Discord, client);
  //         collector.stop('accepted')

  //       } else if (response.startsWith('no')) {

  //         await msg.channel.send(`${msg.author.username} declined the battle, deleting thread in 30s`)
  //         await collector.stop('declined')
  //         setTimeout(async () => {
  //           await Games[gameName].thread.delete()
  //           Games[gameName] = undefined
  //         }, 30000);

  //       } else {
  //         msg.channel.send('Invalid Response, say YES or NO')
  //       }
  //     })

  //     collector.on('end', async (collected, reason) => {
  //       if (reason !== 'declined' && reason !== 'accepted') {
  //         await message.channel.send(`Time to accept has ended, deleting thread`)
  //         await Games[gameName].thread.delete()
  //         Games[gameName].status = GameStatus.COMPLETED
  //       }
  //     })

  //   } catch (error) {
  //     message.reply('Failed to initiate challenge')
  //     console.log(error)
  //   }
  // }
}
