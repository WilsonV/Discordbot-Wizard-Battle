const GameStatus = require("../GameStatus")
const GameTemplate = require('../GameTemplate')

//randomMatch was passed with the guildID already
async function BattleBetweenUsers(player1ID, player2ID, randomMatch, Games, Discord, client) {
  try {
    const channelForBattle = await client.channels.cache.get(randomMatch.battleChannel)
    const player1 = await client.users.fetch(player1ID)
    const player2 = await client.users.fetch(player2ID)

    let alreadyExistGame = Games[`${player1.username} VS. ${player2.username}`]
    let alreadyExistGameV2 = Games[`${player2.username} VS. ${player1.username}`]

    if ((alreadyExistGame && alreadyExistGame.status !== GameStatus.COMPLETED) || (alreadyExistGameV2 && alreadyExistGameV2.status !== GameStatus.COMPLETED)) {
      //if they have a game open, don't make this match
      console.log("there is a already a match between", player1.username, "and", player2.username)
      return
    } else {
      console.log('Starting random match between', player1.username, "and", player2.username)
      const gameName = `${player1.username} VS. ${player2.username}`
      const newThread = await channelForBattle.threads.create({
        name: gameName,
        autoArchiveDuration: 60,
        reason: 'Private Battle!',
      })

      //create game base on template and set the players
      Games[gameName] = Object.create(GameTemplate)
      Games[gameName].thread = newThread
      await Games[gameName].setPlayers(client, player1.id, player2.id)

      //add players to thread
      Games[gameName].addPlayersToThread()

      //Message players to come
      await Games[gameName].thread.send(`Random Battle Time! <@${Games[gameName].player1.id}> Vs. <@${Games[gameName].player2.id}>.\nDo you both accept? (yes or no)`)

      //Create collector to wait for response
      const collector = Games[gameName].thread.createMessageCollector({ filter: (m) => m.author.id === player1.id || m.author.id === player2.id, time: 60000 * 2 })

      collector.on('collect', async (msg) => {
        const response = msg.content.toLowerCase()

        if (response.startsWith('yes')) {
          await msg.channel.send(`${msg.author.username} has accepted the battle!`)

          if (msg.author.id === Games[gameName].player1.id) {
            Games[gameName].player1Accepted = true
          } else if (msg.author.id === Games[gameName].player2.id) {
            Games[gameName].player2Accepted = true
          }

          if (Games[gameName].player1Accepted && Games[gameName].player2Accepted) {
            Games[gameName].status = GameStatus.PLAYER1_CHAR_SELECT
            Games[gameName].playGame(Discord, client);
            collector.stop('accepted')
          }

        } else if (response.startsWith('no')) {
          await msg.channel.send(`${msg.author.username} declined the battle, deleting thread in 30s`)
          await collector.stop('declined')
          setTimeout(async () => {
            await Games[gameName].thread.delete()
            Games[gameName] = undefined
          }, 30000);
        } else {
          msg.reply('Invalid response, yes or no')
        }
      })

      collector.on('end', async (collected, reason) => {
        try {
          if (reason !== 'declined' && reason !== 'accepted') {
            await channelForBattle.send(`Time to accept has ended, deleting thread`)
            await Games[gameName].thread.delete()
            Games[gameName].status = GameStatus.COMPLETED
          }
        } catch (error) {
          console.log(error)
        }

      })

    }
  } catch (error) {
    console.log(error)
  }
}


module.exports = BattleBetweenUsers;
