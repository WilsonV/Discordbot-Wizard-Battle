const GameStatus = require("./GameStatus")
const progressbar = require('./Util/progressBar')
const pipIconID = require("./pipIconID")
const { models: { User } } = require('./db')

module.exports = {
  characterSheetURL: './character_sheet.png',
  status: GameStatus.WAITING_TO_ACCEPT,
  player1: { id: null, username: '', displayAvatarURL: '', character: null, stats: null },
  player2: { id: null, username: '', displayAvatarURL: '', character: null, stats: null },
  thread: null,
  player1Accepted: false, //used for random matches only
  player2Accepted: false, //used for random matches only,
  ranked: false,
  setPlayers: async function (client, p1, p2) {
    try {
      this.player1.id = p1
      this.player2.id = p2

      const player1Info = await client.users.fetch(this.player1.id)
      //this.player1.displayAvatarURL = player1Info.displayAvatarURL()
      this.player1.username = player1Info.username

      const player2Info = await client.users.fetch(this.player2.id)
      //this.player2.displayAvatarURL = player2Info.displayAvatarURL()
      this.player2.username = player2Info.username

    } catch (error) {
      console.log("Failed to set players for game")
      console.log(error)
      throw "Could not add players to the game";
    }


  },
  addPlayersToThread: async function () {
    try {

      if (!this.player1 || !this.player2) {
        throw 'no players'
      }

      await this.thread.members.add(this.player1.id)
      await this.thread.members.add(this.player2.id)

    } catch (error) {
      console.log(error)
      if (error !== 'no players')
        throw "cant add players"
    }
  },
  showEnemyQuickInfo: async function (Discord, player) {
    try {
      const attachment = new Discord.AttachmentBuilder('characters/' + player.character.imgURL, { name: "profile_pic.gif" })
      const newEmbed = new Discord.EmbedBuilder()
        .setTimestamp(Date.now())
        .setTitle(`${player.username}'s stats (${player.character.name})`)
        .setThumbnail('attachment://profile_pic.gif')
        .setDescription(`${player.character.name}'s Stats`)

      // These color's are swapped
      if (this.status === GameStatus.PLAYER1_TURN) {
        newEmbed.setColor("#00FF00")
      } else {
        newEmbed.setColor("#FF0000")
      }
      newEmbed.addFields([
        {
          name: 'Health',
          value: `${progressbar.filledBar(player.character.maxHealth, Math.max(player.character.health, 0), 10)}`,
          inline: true
        },
        {
          name: 'Pips',
          value: `${progressbar.filledBar(14, player.character.pips, 14, ' ')}`,
          inline: true
        },
        {
          name: 'Damage',
          value: `${progressbar.filledBar(100, player.character.damage, 10, ' ')}`,
          inline: true
        },
        {
          name: 'Resist',
          value: `${progressbar.filledBar(100, player.character.resist, 10, ' ')}`,
          inline: true
        },
        {
          name: 'Accuracy',
          value: `${progressbar.filledBar(100, player.character.accuracy, 10, ' ')}`,
          inline: true
        },
        {
          name: `${player.character.healBoost == 0 ? '-' : 'Heal Boost'}`,
          value: `${player.character.healBoost == 0 ? '-' : player.character.healBoost}`,
          inline: true
        }
      ])

      await this.thread.send({ embeds: [newEmbed], files: [attachment] })
    } catch (error) {
      console.log("Could not show enemy quick info.")
      console.log(error)
      throw "Can't show enemy quick Info"
    }
  },
  showPlayerInfo: async function (Discord, player) {

    try {

      const attachment = new Discord.AttachmentBuilder('characters/' + player.character.imgURL, { name: "profile_pic.gif" })

      const newEmbed = new Discord.EmbedBuilder()
        .setTimestamp(Date.now())
        .setTitle(`${player.username}'s stats (${player.character.name})`)
        .setThumbnail('attachment://profile_pic.gif')
        .setDescription(`${player.character.passive ? `**Passive**: ${typeof player.character.passiveEffect === 'function' ? player.character.passiveEffect() : player.character.passiveEffect}` : 'No passive effect'}`)

      if (this.status === GameStatus.PLAYER1_TURN) {
        newEmbed.setColor("#FF0000")
      } else {
        newEmbed.setColor("#00FF00")
      }

      newEmbed.addFields([
        {
          name: 'Health',
          value: `${progressbar.filledBar(player.character.maxHealth, Math.max(player.character.health, 0), 10)}`,
          inline: true
        },
        {
          name: 'Pips',
          value: `${progressbar.filledBar(100, player.character.pips, 10, ' ')}`,
          inline: true
        },
        {
          name: 'Damage',
          value: `${progressbar.filledBar(100, player.character.damage, 10, ' ')}`,
          inline: true
        },
        {
          name: 'Resist',
          value: `${progressbar.filledBar(100, player.character.resist, 10, ' ')}`,
          inline: true
        },
        {
          name: 'Accuracy',
          value: `${progressbar.filledBar(100, player.character.accuracy, 10, ' ')}`,
          inline: true
        },
        {
          name: `${player.character.healBoost == 0 ? '-' : 'Heal Boost'}`,
          value: `${player.character.healBoost == 0 ? '-' : player.character.healBoost}`,
          inline: true
        }
      ])

      newEmbed.addFields(
        player.character.abilities().map((ability, index) => {
          let frontTag = '', endTag = ''
          if (player.character.pips < ability.cost) {
            frontTag = `~~`
            endTag = `~~`
          }

          return { name: `${frontTag}[${index}] ${ability.name}${endTag}`, value: frontTag + "```Cost: " + ability.cost + "\nEffect: " + ability.effect + "```" + endTag, inline: true }
        })
      )

      await this.thread.send({ embeds: [newEmbed], files: [attachment] })

    } catch (error) {
      console.log("Could not show player info")
      console.log(error)
      throw "Can't show player Info"
    }
  },
  runPlayersTurn: async function (Discord, client) {
    try {
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
      await this.showEnemyQuickInfo(Discord, enemy)
      await this.showPlayerInfo(Discord, player)
    } catch (error) {
      console.log("Failed to perform players turn")
      console.log(error)
      throw "Fail to run players turn"
    }
  },
  playGame: async function (Discord, client) {
    try {
      const attachment = new Discord.AttachmentBuilder(this.characterSheetURL, { name: "character_sheet.png" })

      //Ask player 2 to select a hero
      const characterList = new Discord.EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Select a character')
        .setDescription(`<@${this.player1.id}> select a character using their name (no space)`)
        .setImage('attachment://character_sheet.png')

      await this.thread.send({ embeds: [characterList], files: [attachment] })

      //Create collector to wait for response
      const p1_id = this.player1.id, p2_id = this.player2.id
      const collector = this.thread.createMessageCollector({ filter: (m) => m.author.id === p1_id || m.author.id === p2_id, time: 60000 * 20 })

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
          if (response === 'flee') {
            player.character.health = 0
            await this.thread.send(`${player.username} has fleed!`)
            winningMessage = await this.thread.send(`🏆🏆${enemy.username} Has Won!🏆🏆`)
            await winningMessage.react('😔')
            if (this.ranked) {
              await this.updateRankings(enemy, player)
            }

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
                    if (this.ranked) {
                      await this.updateRankings(player, enemy)
                    }
                  } else {
                    winningMessage = await this.thread.send(`🏆🏆${enemy.username} Has Won!🏆🏆`)
                    if (this.ranked) {
                      await this.updateRankings(enemy, player)
                    }
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
            return
          }
        }

      })
    } catch (error) {
      console.log("Failed to play game")
      console.log(error)
      throw "Failed to play game"
    }



  },
  updateRankings: async function (winner, losser) {
    try {
      const winnerExpectedWinRate = 1 / (1 + Math.pow(10, (losser.stats.rankPoints - winner.stats.rankPoints) / 400))
      const losserExpectedWinRate = 1 / (1 + Math.pow(10, (winner.stats.rankPoints - losser.stats.rankPoints) / 400))

      //console.log(winner.username, "has gained", Math.floor(200 * (1 - winnerExpectedWinRate), " rank points"))
      const winnerNewRating = winner.stats.rankPoints + Math.floor(200 * (1 - winnerExpectedWinRate))

      await User.update({ rankPoints: winnerNewRating, wins: winner.stats.wins + 1 }, { where: { userID: winner.id } })
      await this.thread.send(`**${winner.username}'s rank has gone up to ${winnerNewRating}!**`)

      //console.log(losser.username, "has lost", Math.ceil(200 * (0 - losserExpectedWinRate), " rank points"))
      const losserNewRating = losser.stats.rankPoints + Math.ceil(200 * (0 - losserExpectedWinRate))

      await User.update({ rankPoints: losserNewRating, losses: losser.stats.losses + 1 }, { where: { userID: losser.id } })
      await this.thread.send(`**${losser.username}'s rank has decreased to ${losserNewRating}.**`)

    } catch (error) {
      console.log(error)
      console.log("Failed to update rank for winner", winner, "and loser", losser)
    }

  }

}
