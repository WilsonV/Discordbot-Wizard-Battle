const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display available commands'),
  adminOnly: false,
  execute(Discord, client, interaction) {

    try {
      const embedMsg = new Discord.EmbedBuilder()
        .setTimestamp(Date.now())
        .setTitle("Commands")
        .setDescription("List of all available commands")
        .setThumbnail("https://static.thenounproject.com/png/1266892-200.png")

      const iterator = client.commands.entries();

      for (const command of iterator) {
        //Index 1 because index 0 is a the key (file name) of the command
        if (command[1].adminOnly) {
          if (interaction.memberPermissions.has(Discord.PermissionFlagsBits.Administrator)) {
            embedMsg.addFields([{
              name: `${command[1].data.name} *(admin only)*`,
              value: command[1].data.description,
              inline: false
            }])
          }

        } else {
          embedMsg.addFields([{
            name: command[1].data.name,
            value: command[1].data.description,
            inline: false
          }])
        }

      }

      embedMsg.addFields([{
        name: '[character name]',
        value: 'Provides stats and details about a character',
        inline: false
      },
      {
        name: 'flee',
        value: 'Flee and surrender an ongoing match *(only in a match)*',
        inline: false
      }])

      interaction.reply({ embeds: [embedMsg] });
    } catch (error) {
      console.log(error)
      interaction.reply("Error, could not get command list.")
    }
  }
}
