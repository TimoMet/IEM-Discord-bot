const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply("Jordan s'est chié dessus dans l'amphi N de Tolbiac, la merde a coulé sur ses chaussures. (pong)");	},
};
