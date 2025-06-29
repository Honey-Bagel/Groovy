const config = require("../../configs/config.json");
const { changeStatus } = require("../../handlers/functions");
const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		try {
			console.log(`[INFO] Logged in as ${client.user.tag} (${client.user.id})`.green);

			let index = await changeStatus(client, 0);

			setInterval(async () => {
				index = await changeStatus(client, index);
			}, 1000 * 60 * 5); // Change status every 5 minutes
		} catch (error) {
			console.log(`Error on ready: ${error.message}`.red);
		}
	}
};