require('dotenv').config()
if (process.env.TEST_MODE === 'true')
  console.log("SERVER STARTED IN TEST MODE");

const PATCH_NUMBER = '1.1'
const dbConnection = require('./db/connect')()
const { models: { Server, User } } = require('./db')
const getUserStats = require('./Util/userStats')

const Discord = require('discord.js')
const fs = require("fs");

const progressbar = require('./Util/progressBar')
const { GatewayIntentBits, REST, Routes, SlashCommandBuilder } = Discord
const { TaskTimer } = require('tasktimer');

const BattleBetweenUsers = require('./Util/userBattle');

const prefix = '!'
const Games = {};
//const randomMatchTemplate = { active: false, channel: null, MatchInterval: 30, KeepPlayersActive: 10 };
const randomMatch = {};

//Create Client Instance
const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
})

//Set up collections
client.commands = new Discord.Collection()
client.characters = new Discord.Collection()

//Load commands
const commandFiles = fs
  .readdirSync("./commands/")
  .filter((file) => file.endsWith(".js"));

client.commandArray = [];

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  client.commandArray.push(command.data.toJSON());
}

const rest = new REST({
  version: '10'
}).setToken(process.env.TEST_MODE === 'true' ? process.env.TEST_BOT_KEY : process.env.BOT_KEY);

//Register Commands
(async () => {
  try {
    console.log("Refreshing application (/) commands");

    await rest.put(
      Routes.applicationCommands(process.env.TEST_MODE === 'true' ? process.env.TEST_CLIENT_ID : process.env.CLIENT_ID),
      {
        body: client.commandArray
      }
    );

    console.log("Successfully reloaded application (/) commands.")
  } catch (error) {
    console.log(error)
    process.exit(0);
  }
})();

//Load characters
const characterFiles = fs
  .readdirSync('./characters/')
  .filter((file) => file.endsWith(".js"))

for (const file of characterFiles) {
  const character = require(`./characters/${file}`);

  client.characters.set(character.nickname, character);
}

async function randomMatchTimerEnd(guildId) {
  try {
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
    }
  } catch (error) {
    console.log("Failed to start random match between users")
    console.log(error)
  }

}

client.once('ready', async () => {

  try {
    const attachment = new Discord.AttachmentBuilder('characters/Images/malistaire/malistaire.png', { name: "profile_pic.gif" })

    const welcomeEmbed = new Discord.EmbedBuilder()
      .setTimestamp(Date.now())
      .setThumbnail('attachment://profile_pic.gif')
      .setTitle(`Update! Slash Commands!`)
      .setURL("https://dsc.gg/character-battle")
      .setDescription("Need Help? Have Suggestions? Visit: https://dsc.gg/character-battle")
      .addFields([
        {
          name: "Slash Commands Added",
          value: "```Slash Commands has been added to make bot easier to use.```"
        }
      ])


    async function informServersOfPatchNotes(serverID) {
      try {

        if (randomMatch[serverID]?.patchNumber === PATCH_NUMBER)
          return;

        let channel = client.channels.cache.get(randomMatch[serverID].battleChannel)

        if (channel) {
          channel.send({ embeds: [welcomeEmbed], files: [attachment] })
          await Server.update({ patchNumber: PATCH_NUMBER }, { where: { serverID } })
        } else {
          console.log("Channel did not exist")
        }

      } catch (error) {
        console.log("Failed to send patch notes to serverID", serverID)
        console.log(error)
      }
    }

    client.guilds.cache.each(async (guild) => {
      randomMatch[guild.id] = await Server.findOne({ where: { serverID: guild.id }, attributes: { exclude: ['id'] }, raw: true })

      if (randomMatch[guild.id]) {
        activateTimer(guild.id)
        informServersOfPatchNotes(guild.id);
      }
    })

    console.log("Wizard Battle Bot is online!")
  } catch (error) {
    console.log(error)
  }

})

function activateTimer(guildId) {
  try {
    randomMatch[guildId].activePlayers = {}
    randomMatch[guildId].activePlayerTrackTimer = new TaskTimer(60000 * randomMatch[guildId].matchInterval)
    randomMatch[guildId].activePlayerTrackTimer.on('tick', () => randomMatchTimerEnd(guildId))
    randomMatch[guildId].activePlayerTrackTimer.start()
  } catch (error) {
    console.log("Failed to start timer for guild, ID:", guildId)
    console.log(error)
  }

}

client.on('messageCreate', (message) => {

  try {
    //Random Matches registry
    if (!message.content.startsWith(prefix) && !message.author.bot && randomMatch[message.guildId]) {
      randomMatch[message.guildId].activePlayers[message.author.id] = Date.now() + (60000 * randomMatch[message.guildId].keepPlayersActive)
    }

  } catch (error) {
    console.log(error)
  }

})

client.on('interactionCreate', (interaction) => {

  try {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.commandName;

    if (client.commands.has(command)) {

      // console.log("Running Command", command);
      client.commands.get(command).execute(Discord, client, interaction, Games, randomMatch, activateTimer)//**do not pass in guild id on randomMatch for commands due to scope */

    } else {
      try {
        interaction.reply("That's NOT a command.")
      } catch (error) {
        console.log(error)
      }
      return;
    }

  } catch (error) {
    try {
      interaction.reply("An error occured.")
    } catch (error_2) {
      console.log(error_2)
    }
    console.log(error)
  }
})

client.login(process.env.TEST_MODE === 'true' ? process.env.TEST_BOT_KEY : process.env.BOT_KEY)
