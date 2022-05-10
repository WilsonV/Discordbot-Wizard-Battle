const Discord = require('discord.js')
const fs = require("fs");
//const progressbar = require('string-progressbar')
const progressbar = require('./Util/progressBar')
const { Intents } = Discord
require('dotenv').config()
const { TaskTimer } = require('tasktimer');
const GameStatus = require('./GameStatus');
const GameTemplate = require('./GameTemplate');
const BattleBetweenUsers = require('./Util/userBattle');

const prefix = '!'
const Games = {};
const randomMatch = { active: false, channel: null, MatchInterval: 30, KeepPlayersActive: 10 };
const activePlayers = {}

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



client.once('ready', () => {
  console.log("Wizard Battle Bot is online!")
})

const activePlayerTrackTimer = new TaskTimer(60000 * randomMatch.MatchInterval)

//removes players after their time has expired
activePlayerTrackTimer.on('tick', async () => {

  if (!randomMatch.active || !randomMatch.channel) return

  //console.log("Generating a random match...")
  const listOfPlayers = []

  //Remove inactive players
  for (const player in activePlayers) {
    // console.log("updating info for",player)
    // console.log("listed time is",activePlayers[player],", time now is",Date.now())
    if (activePlayers[player] < Date.now()) {
      //console.log("deleting",player,"from list of active")
      delete activePlayers[player]
    } else {
      //console.log("adding",player,"as match candidate")
      listOfPlayers.push(player)
    }
  }

  //Run match if we have more than 1 player
  if (listOfPlayers.length > 1) {
    //console.log("attempting to start match, we have enough players")
    const firstContestant = listOfPlayers.splice(Math.floor(Math.random() * listOfPlayers.length), 1)
    const secondContestant = listOfPlayers.splice(Math.floor(Math.random() * listOfPlayers.length), 1)

    BattleBetweenUsers(firstContestant[0], secondContestant[0], randomMatch, Games, Discord, client)
  } else {
    //console.log("Not enough players to start a match")
    //console.log("list of players", listOfPlayers)
  }
})

activePlayerTrackTimer.start()

client.on('messageCreate', (message) => {

  try {
    //Random Matches registry
    if (!message.content.startsWith(prefix) && !message.author.bot) {
      activePlayers[message.author.id] = Date.now() + (60000 * randomMatch.KeepPlayersActive)
    }

    //Command code behavior (prevents commands outside of match channel)
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(" ");
    const command = args.shift().toLowerCase();

    if (client.commands.has(command)) {
      if (client.commands.get(command).adminOnly && !message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply('This is an admin on command, sorry.')
      }
      client.commands.get(command).execute(Discord, client, message, args, Games, randomMatch)
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
