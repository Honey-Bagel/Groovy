const { Events } = require("distube");
const { EmbedBuilder } = require("discord.js");
const MusicHandler = require("../../handlers/musicHandler.js");
const musicHandler = MusicHandler.getInstance();

module.exports = {
	name: Events.DELETE_QUEUE,
	execute: async (queue, client) => {
		try {
			musicHandler.cleanupGuild(queue.textChannel.guildId);
		} catch (err) {
			console.log(`[ERROR] {Events} Failed to delete queue: ${err.message}`.red);
			sendErrorMessage(queue.textChannel, "Failed to delete queue", err.message);
		}
	}
};