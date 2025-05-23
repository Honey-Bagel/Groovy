const { Events } = require("distube");
const { EmbedBuilder } = require("discord.js");
const { sendErrorMessage } = require("../../handlers/functions.js");
const MusicHandler = require("../../handlers/musicHandler.js");
const musicHandler = MusicHandler.getInstance();

module.exports = {
	name: Events.INIT_QUEUE,
	execute: async (queue, client) => {
		try {
			// do nothing for now
		} catch (err) {
			console.log(`[ERROR] {Events} Failed to init queue: ${err.message}`.red);
			sendErrorMessage(queue.textChannel, "Failed to init queue", err.message);
		}
	}
};