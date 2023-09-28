const { SlashCommandBuilder } = require('discord.js')
const { characterSheetURL } = require('../GameTemplate')
const progressbar = require('../Util/progressBar')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('character')
    .setDescription("View a character's stat")
    .addStringOption(option =>
      option
        .setName('character-name')
        .setDescription('Name of character to view stats of')
        .addChoices(
          {
            name: 'alhazred',
            value: 'alhazred'
          },
          {
            name: 'gurtok',
            value: 'gurtok',
          },
          {
            name: 'jadeoni',
            value: 'jadeoni',
          },
          {
            name: 'lydia',
            value: 'lydia',
          },
          {
            name: 'malistaire',
            value: 'malistaire',
          },
          {
            name: 'sealord',
            value: 'sealord',
          },
          {
            name: 'spider',
            value: 'spider',
          },
          {
            name: 'zeus',
            value: 'zeus',
          }
        )
        .setRequired(true)),
  adminOnly: false,
  async execute(Discord, client, interaction) {
    try {
      let currentCharacter = { ...client.characters.get(interaction.options.get('character-name').value) }
      if (!currentCharacter) {
        throw "Unknown character"
      }

      const attachment = new Discord.AttachmentBuilder('./characters/' + currentCharacter.imgURL, { name: "profile_pic.gif" })

      const newEmbed = new Discord.EmbedBuilder()
        .setTimestamp(Date.now())
        .setColor("#ffffff")
        .setTitle(`${currentCharacter.name}'s stats`)
        .setThumbnail('attachment://profile_pic.gif')
        .setDescription(`${currentCharacter.passive ? `**Passive**: ${typeof currentCharacter.passiveEffect === 'function' ? currentCharacter.passiveEffect() : currentCharacter.passiveEffect}` : 'No passive effect'}`)
        .addFields([
          {
            name: 'Health',
            value: `${progressbar.filledBar(currentCharacter.maxHealth, currentCharacter.health, 10)}`,
            inline: true
          },
          {
            name: 'Pips',
            value: `${progressbar.filledBar(100, currentCharacter.pips, 10, ' ')}`,
            inline: true
          },
          {
            name: 'Damage',
            value: `${progressbar.filledBar(100, currentCharacter.damage, 10, ' ')}`,
            inline: true
          },
          {
            name: 'Resist',
            value: `${progressbar.filledBar(100, currentCharacter.resist, 10, ' ')}`,
            inline: true
          },
          {
            name: 'Accuracy',
            value: `${progressbar.filledBar(100, currentCharacter.accuracy, 10, ' ')}`,
            inline: true
          },
          {
            name: '-',
            value: '-',
            inline: true
          }
        ]);



      //Add abilities to list
      newEmbed.addFields(
        currentCharacter.abilities().map((ability, index) => {
          return { name: `[${index}] ${ability.name}`, value: "```Cost: " + ability.cost + "\nEffect: " + ability.effect + "```", inline: true }
        })
      )

      //send embed
      try {
        interaction.reply({ embeds: [newEmbed], files: [attachment] })
      } catch (error) {
        console.log(error)
      }

    } catch (error) {
      console.log(error)
      interaction?.reply("Could not get character info.")
    }

  }
}

