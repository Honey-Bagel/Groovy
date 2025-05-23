const config = require("../../configs/config.json");
const { change_status } = require("../../handlers/functions");
const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		try {
			console.log(`[INFO] Logged in as ${client.user.tag} (${client.user.id})`.green);
		} catch (error) {
			console.log(`Error on ready: ${error.message}`.red);
		}
		change_status(client);

		setInterval(() => {
			change_status(client);
		}, 15 * 1000);
	}
};