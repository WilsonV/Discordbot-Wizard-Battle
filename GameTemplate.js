const GameStatus = require("./GameStatus")
const progressbar = require('./Util/progressBar')
const pipIconID = require("./pipIconID")
const { models: { User } } = require('./db')

module.exports = {
  characterSheetURL: 'https://i.imgur.com/WSUtfNP.png',
  status: GameStatus.WAITING_TO_ACCEPT,
  player1: { id: null, username: '', displayAvatarURL: '', character: null, stats: null },
  player2: { id: null, username: '', displayAvatarURL: '', character: null, stats: null },
  thread: null,
  player1Accepted: false, //used for random matches only
  player2Accepted: false, //used for random matches only,
  ranked: false,
  setPlayers: async function (client, p1, p2) {
    this.player1.id = p1
    this.player2.id = p2

    const player1Info = await client.users.fetch(this.player1.id)
    //this.player1.displayAvatarURL = player1Info.displayAvatarURL()
    this.player1.username = player1Info.username

    const player2Info = await client.users.fetch(this.player2.id)
    //this.player2.displayAvatarURL = player2Info.displayAvatarURL()
    this.player2.username = player2Info.username

  },
  addPlayersToThread: async function () {
    if (this.player1 && this.player2) {
      await this.thread.members.add(this.player1.id)
      await this.thread.members.add(this.player2.id)
    } else {
      throw 'Failed to add players to thread'
    }
  },
  showPlayerInfo: async function (Discord, player) {
    //console.log('Showing this player',player.character)
    const newEmbed = new Discord.MessageEmbed()
      .setTimestamp(Date.now())
      .setTitle(`${player.username}'s stats (${player.character.name})`)
      .setThumbnail(player.character.imgURL)
      .setDescription(`${player.character.passive ? `**Passive**: ${typeof player.character.passiveEffect === 'function' ? player.character.passiveEffect() : player.character.passiveEffect}` : 'No passive effect'}`)

    if (this.status === GameStatus.PLAYER1_TURN) {
      newEmbed.setColor("#FF0000")
    } else {
      newEmbed.setColor("#00FF00")
    }


    //Add stats
    //console.log("characters health is",currentCharacter.health)
    newEmbed.addField('Health', `${progressbar.filledBar(player.character.maxHealth, player.character.health, 10)}`, true)
    newEmbed.addField('Pips', `${progressbar.filledBar(14, player.character.pips, 14, ' ')}`, true)
    newEmbed.addField('Damage', `${progressbar.filledBar(100, player.character.damage, 10, ' ')}`, true)
    newEmbed.addField('Resist', `${progressbar.filledBar(100, player.character.resist, 10, ' ')}`, true)
    newEmbed.addField('Accuracy', `${progressbar.filledBar(100, player.character.accuracy, 10, ' ')}`, true)
    player.character.healBoost ? newEmbed.addField('Heal Boost', `${Math.ceil((player.character.healBoost - 1) * 100)}%`, true) : newEmbed.addField('-', '-', true) // empty spot

    newEmbed.addFields(
      player.character.abilities().map((ability, index) => {
        let frontTag = '', endTag = ''
        if (player.character.pips < ability.cost) {
          frontTag = `~~`
          endTag = `~~`
        }

        return { name: `${frontTag}[${index}] ${ability.name}${endTag}`, value: `\n${frontTag}Cost: ${ability.cost} \nEffect: ${ability.effect}${endTag}`, inline: true }
      })
    )

    await this.thread.send({ embeds: [newEmbed] })
  },
  runPlayersTurn: async function (Discord, client) {

    let player = null
    let enemy = null

    if (this.status === GameStatus.PLAYER1_TURN) {
      player = this.player1
      enemy = this.player2
    }
    if (this.status === GameStatus.PLAYER2_TURN) {
      player = this.player2
      enemy = this.player1
    }


    await this.thread.send(`${player.username}'s Turn, Select a move`)
    if (player.character.passive) {
      let response = player.character.passive(enemy.character)
      if (response) this.thread.send(response)
    }
    await this.showPlayerInfo(Discord, player)

  },
  playGame: async function (Discord, client, Games) {
    //Ask player 2 to select a hero
    const characterList = new Discord.MessageEmbed()
      .setColor('#00ff00')
      .setTitle('Select a character')
      .setDescription(`<@${this.player1.id}> select a character using their name (no space)`)
      .setImage(this.characterSheetURL)

    await this.thread.send({ embeds: [characterList] })
    //Create collector to wait for response
    const p1_id = this.player1.id, p2_id = this.player2.id
    const collector = this.thread.createMessageCollector({ filter: (m) => m.author.id === p1_id || m.author.id === p2_id, time: 60000 * 55 })
    //collector.status = this.status

    collector.on('collect', async (msg) => {
      let response = msg.content.toLowerCase()

      if (response === 'random') {
        //make an array of all the characters
        const availableCharacters = Array.from(client.characters.keys())
        //select one at random and make that the response
        response = availableCharacters[Math.floor(Math.random() * availableCharacters.length)]
      }

      //Make sure we take response from the right player
      if (this.status === GameStatus.PLAYER1_CHAR_SELECT && msg.author.id === this.player1.id) {
        if (client.characters.has(response)) {
          this.player1.character = { ...client.characters.get(response) }
          // await this.thread.send(`${msg.author.username} selected ${this.player1.character.name}!`)
          msg.react('✅')
          await this.thread.send(`<@${this.player2.id}>, your turn. Select a character.`)
          this.status = GameStatus.PLAYER2_CHAR_SELECT
          return
        } else {
          msg.reply("Invalid character choice.")
        }
      }

      if (this.status === GameStatus.PLAYER2_CHAR_SELECT && msg.author.id === this.player2.id) {
        if (client.characters.has(response)) {
          this.player2.character = { ...client.characters.get(response) }
          //await this.thread.send(`${msg.author.username} selected ${this.player2.character.name}!`)
          msg.react('✅')
          this.status = GameStatus.PLAYER2_TURN
          // console.log('Player 1:',this.player1.character)
          // console.log('Player 2:',this.player2.character)
          await this.runPlayersTurn(Discord, client)
          return
        } else {
          // msg.reply("Invalid character choice.")
          msg.react('❌')
        }
      }

      if (this.status === GameStatus.PLAYER2_TURN || this.status === GameStatus.PLAYER1_TURN) {
        if (this.status === GameStatus.PLAYER2_TURN && msg.author.id !== this.player2.id) return
        if (this.status === GameStatus.PLAYER1_TURN && msg.author.id !== this.player1.id) return
        let player, enemy

        if (this.status === GameStatus.PLAYER1_TURN) {
          player = this.player1
          enemy = this.player2
        } else {
          player = this.player2
          enemy = this.player1
        }
        //If the user flee
        if (response === '!flee') {
          player.character.health = 0
          await this.thread.send(`${player.username} has fleed!`)
          winningMessage = await this.thread.send(`🏆🏆${enemy.username} Has Won!🏆🏆`)
          await winningMessage.react('😔')
          await this.updateRankings(enemy, player)

          this.status = GameStatus.COMPLETED
          collector.stop('finished')
          this.thread.send('This thread is deleting in 60s')
          setTimeout(async () => {
            this.thread.delete()
          }, 60000)
          return
        }
        const choice = Number(response)

        if (!isNaN(choice)) {
          if (!player.character.abilities()[choice]) return msg.react('⁉')
          const ability = player.character.abilities()[choice]
          if (player.character.pips < ability.cost) {
            msg.react(pipIconID)
            return
          }
          //console.log(ability)
          this.thread.send(`${player.username} uses ${ability.name}...`)
          const attackResult = ability.execute(enemy.character)
          if (attackResult.status === 'success') {

            if (attackResult.type === 'attack') {

              this.thread.send(`Success! ${player.username} hit ${enemy.username} for ${attackResult.damage}💥 ${attackResult.secondDamage ? `& ${attackResult.secondDamage}💥` : ``} ${attackResult.thirdDamage ? `& ${attackResult.thirdDamage}💥` : ``} ${attackResult.buff ? `,${attackResult.buff}` : ''} ${attackResult.debuff ? `,${attackResult.debuff}` : ''}`)

              if (enemy.character.health <= 0 || player.character.health <= 0) {
                let winningMessage;
                if (enemy.character.health <= 0) {
                  winningMessage = await this.thread.send(`🏆🏆${player.username} Has Won!🏆🏆`)
                  await this.updateRankings(player, enemy)
                } else {
                  winningMessage = await this.thread.send(`🏆🏆${enemy.username} Has Won!🏆🏆`)
                  await this.updateRankings(enemy, player)
                }

                if (player.character.health === player.character.maxHealth || enemy.character.health === enemy.character.maxHealth) {
                  await winningMessage.react('🇪')
                  await winningMessage.react('🇿')
                  await winningMessage.react('💯')
                  winningMessage.react('🤣')
                } else if (player.character.health > player.character.maxHealth * .8 || enemy.character.health > enemy.character.maxHealth * .8) {
                  await winningMessage.react('🇪')
                  winningMessage.react('🇿')
                } else if (player.character.health > player.character.maxHealth * .45 || enemy.character.health > enemy.character.maxHealth * .45) {
                  Math.random() > .5 ? await winningMessage.react('🤣') : await winningMessage.react('😏')

                } else if (player.character.health > player.character.maxHealth * .1 || enemy.character.health > enemy.character.maxHealth * .1) {
                  await winningMessage.react('😝')
                  winningMessage.react('🔥')
                } else {
                  winningMessage.react('🔥')
                  winningMessage.react('🔥')
                  winningMessage.react('🔥')
                }

                this.status = GameStatus.COMPLETED
                collector.stop('finished')
                this.thread.send('This thread is deleting in 60s')
                setTimeout(async () => {
                  this.thread.delete()
                }, 60000)
                return

              }
            } else if (attackResult.type === 'restore') {
              this.thread.send(`Success! You've Restored ${attackResult.buff}`)
            } else if (attackResult.type === 'buff') {
              this.thread.send(`Success! You've ${attackResult.buff}`)
            } else if (attackResult.type === 'debuff') {
              this.thread.send(`Success! ${player.username} applied ${attackResult.debuff} on ${enemy.username}`)
            } else if (attackResult.type === 'transform') {
              this.thread.send(`Success! ${player.username} has transformed to ${attackResult.form}\nYou've received ${attackResult.buff}`)
            }

          } else {
            this.thread.send(`${player.username} Missed!`)
          }

          if (!player.character.extraTurn || player.character.extraTurn === 0) {
            if (this.status === GameStatus.PLAYER1_TURN) {
              this.status = GameStatus.PLAYER2_TURN
            } else {
              this.status = GameStatus.PLAYER1_TURN
            }
          }
          await this.runPlayersTurn(Discord, client)
          return
        } else {
          //msg.reply('Please enter a number')
          return
        }
      }

      //collector.resetTimer({ time: 60000 * 5 })
    })

    // collector.on('end', async (collected, reason) => {
    //   if (reason !== 'finished') {
    //     if(client)
    //     await this.thread.send(`Game has ended due to no response. closing thread in 30s`)
    //     await this.thread.setArchived(true)
    //     setTimeout(() => {
    //       this.thread.delete()
    //       this.status = GameStatus.COMPLETED
    //     }, 30000);
    //   }
    // })
  },
  updateRankings: async function (winner, losser) {
    const winnerExpectedWinRate = 1 / (1 + Math.pow(10, (losser.stats.rankPoints - winner.stats.rankPoints) / 400))
    const losserExpectedWinRate = 1 / (1 + Math.pow(10, (winner.stats.rankPoints - losser.stats.rankPoints) / 400))

    console.log(winner.username, "has gained", Math.floor(200 * (1 - winnerExpectedWinRate), " rank points"))
    const winnerNewRating = winner.stats.rankPoints + Math.floor(200 * (1 - winnerExpectedWinRate))

    await User.update({ rankPoints: winnerNewRating, wins: winner.stats.wins++ }, { where: { userID: winner.id } })
    await this.thread.send(`**${winner.username}'s rank has gone up to ${winnerNewRating}!**`)

    console.log(losser.username, "has lost", Math.ceil(200 * (0 - losserExpectedWinRate), " rank points"))
    const losserNewRating = losser.stats.rankPoints + Math.ceil(200 * (0 - losserExpectedWinRate))
    await User.update({ rankPoints: losserNewRating, losses: losser.stats.losses++ }, { where: { userID: losser.id } })
    await this.thread.send(`**${losser.username}'s rank has decreased to ${losserNewRating}.**`)
  }

}
