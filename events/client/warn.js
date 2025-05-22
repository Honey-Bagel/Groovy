const { Events } = require('discord.js');

module.exports = {
	name: Events.Warn,
	execute(client, error) {
		console.log(String(error).yellow.dim);
	}
};