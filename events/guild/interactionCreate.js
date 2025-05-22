const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	execute: async (client, interaction) => {
		console.log("interaction");
	}
};