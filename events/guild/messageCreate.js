const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	execute: async (message) => {
		console.log("message");
	}
};