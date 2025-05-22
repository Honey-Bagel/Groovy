const { Events } = require('discord.js');

module.exports = {
	name: Events.Debug,
	once: false,
	execute(client) {
		//console.log(String(info).grey);
	},
};