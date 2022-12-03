require('dotenv').config()
const dbConnection = require('./db/connect')()
const { models: { Server, User } } = require('./db')
const getUserStats = require('./Util/userStats')

const Discord = require('discord.js')
const fs = require("fs");

const progressbar = require('./Util/progressBar')
const { Intents } = Discord
const { TaskTimer } = require('tasktimer');

const BattleBetweenUsers = require('./Util/userBattle');

const prefix = '!'
const Games = {};
//const randomMatchTemplate = { active: false, channel: null, MatchInterval: 30, KeepPlayersActive: 10 };
const randomMatch = {};

//Create Client Instance
const client = new Discord.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ]
})

//Set up collections
client.commands = new Discord.Collection()
client.characters = new Discord.Collection()

//Load commands
const commandFiles = fs
  .readdirSync("./commands/")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  client.commands.set(command.name, command);
}

//Load characters
const characterFiles = fs
  .readdirSync('./characters/')
  .filter((file) => file.endsWith(".js"))

for (const file of characterFiles) {
  const character = require(`./characters/${file}`);

  client.characters.set(character.nickname, character);
}

async function randomMatchTimerEnd(guildId) {

  if (!randomMatch[guildId].active || !randomMatch[guildId].battleChannel) return

  //console.log("Generating a random match...")
  const listOfPlayers = []

  //Remove inactive players
  for (const player in randomMatch[guildId].activePlayers) {
    if (randomMatch[guildId].activePlayers[player] < Date.now()) {
      delete randomMatch[guildId].activePlayers[player]
    } else {
      listOfPlayers.push(player)
    }
  }

  //Run match if we have more than 1 player
  if (listOfPlayers.length > 1) {
    try {
      //console.log("attempting to start match, we have enough players")
      const firstContestant = listOfPlayers.splice(Math.floor(Math.random() * listOfPlayers.length), 1)
      const secondContestant = listOfPlayers.splice(Math.floor(Math.random() * listOfPlayers.length), 1)

      //Get stats for botch contestants
      const player1Stats = await getUserStats(firstContestant[0])
      const player2Stats = await getUserStats(secondContestant[0])

      BattleBetweenUsers(firstContestant[0], secondContestant[0], randomMatch[guildId], Games, Discord, client, player1Stats, player2Stats)
    } catch (error) {
      console.log(error)
    }

  } else {
    //console.log("Not enough players to start a match")
    //console.log("list of players", listOfPlayers)
  }
}

// async function getUserStats(userDiscordID) {
//   try {
//     const userData = await User.findOrCreate({ where: { userID: userDiscordID } })
//     const { id, userID, ...playerStats } = userData[0].toJSON()
//     console.log("Found Player1 Stats as", playerStats)
//     return playerStats
//   } catch (error) {
//     console.log(error)
//     return new Error("Failed to get user's stats")
//   }

// }

client.once('ready', async () => {

  try {

    //Load up server and their battle channel
    //console.log("Loading Guild List settings")
    client.guilds.cache.each(async (guild) => {
      randomMatch[guild.id] = await Server.findOne({ where: { serverID: guild.id }, attributes: { exclude: ['id'] }, raw: true })
      //console.log(guild.id, ":", randomMatch[guild.id])
      if (randomMatch[guild.id]) {
        //client.channels.cache.get(randomMatch[guild.id].battleChannel).send("Wizard Battle Bot is online!")
        activateTimer(guild.id)
      }
    })
    console.log("Wizard Battle Bot is online!")
    //console.log("Finished loading list", randomMatch)
  } catch (error) {
    console.log(error)
  }

})

function activateTimer(guildId) {
  randomMatch[guildId].activePlayers = {}
  randomMatch[guildId].activePlayerTrackTimer = new TaskTimer(60000 * randomMatch[guildId].matchInterval)
  randomMatch[guildId].activePlayerTrackTimer.on('tick', () => randomMatchTimerEnd(guildId))
  randomMatch[guildId].activePlayerTrackTimer.start()
}

client.on('messageCreate', (message) => {

  try {
    //Random Matches registry
    if (!message.content.startsWith(prefix) && !message.author.bot && randomMatch[message.guildId]) {
      randomMatch[message.guildId].activePlayers[message.author.id] = Date.now() + (60000 * randomMatch[message.guildId].keepPlayersActive)
    }

    //Command code behavior (prevents commands outside of match channel)
    if (!message.content.startsWith(prefix) || message.author.bot || message.content.toLowerCase() === prefix + 'flee') return;

    const args = message.content.slice(prefix.length).split(" ");
    const command = args.shift().toLowerCase();

    if (client.commands.has(command)) {
      if (client.commands.get(command).adminOnly && !message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply('This is an admin on command, sorry.')
      }
      client.commands.get(command).execute(Discord, client, message, args, Games, randomMatch, activateTimer) //**do not pass in guild id on randomMatch for commands due to scope */
    } else if (client.characters.has(command)) {

      let currentCharacter = client.characters.get(command)

      const newEmbed = new Discord.MessageEmbed()
        .setTimestamp(Date.now())
        .setColor("#ffffff")
        .setTitle(`${currentCharacter.name}'s stats`)
        .setThumbnail(currentCharacter.imgURL)
        .setDescription(`${currentCharacter.passive ? `**Passive**: ${typeof currentCharacter.passiveEffect === 'function' ? currentCharacter.passiveEffect() : currentCharacter.passiveEffect}` : 'No passive effect'}`)
      // .setFooter({ text: `${' - '.repeat(40)}` })

      //Add stats
      //console.log("characters health is",currentCharacter.health)
      newEmbed.addField('Health', `${progressbar.filledBar(currentCharacter.maxHealth, currentCharacter.health, 10)}`, true)
      newEmbed.addField('Pips', `${progressbar.filledBar(14, currentCharacter.pips, 14, ' ')}`, true)
      newEmbed.addField('Damage', `${progressbar.filledBar(100, currentCharacter.damage, 10, ' ')}`, true)
      newEmbed.addField('Resist', `${progressbar.filledBar(100, currentCharacter.resist, 10, ' ')}`, true)
      newEmbed.addField('Accuracy', `${progressbar.filledBar(100, currentCharacter.accuracy, 10, ' ')}`, true)
      currentCharacter.healBoost ? newEmbed.addField('Heal Boost', `${(currentCharacter.healBoost - 1) * 100}%`, true) : newEmbed.addField('-', '-', true) // empty spot

      newEmbed.addFields(
        currentCharacter.abilities().map((ability, index) => {
          return { name: `[${index}] ${ability.name}`, value: `\nCost: ${ability.cost} \nEffect: ${ability.effect}`, inline: true }
        })
      )

      message.reply({ embeds: [newEmbed] })
    } else {
      return message.reply("That's NOT a command.")
    }

  } catch (error) {
    message.reply("An error occured.")
    console.log(error)
  }
})

client.login(process.env.BOT_KEY)
