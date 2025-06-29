const { Events } = require("distube");
const { EmbedBuilder } = require("discord.js");
const MusicHandler = require("../../handlers/musicHandler.js");
const musicHandler = MusicHandler.getInstance();

module.exports = {
	name: Events.FINISH_SONG,
	execute: (queue, song, client) => {
		// Do nothing, nothing to handle as of right now
		try {
			musicHandler.updateQueueMessage(queue.voiceChannel.guildId, queue);
		} catch (err) {
			console.log(`[ERROR] {Events} Failed to add song to queue: ${err.message}`.red);
			sendErrorMessage(queue.textChannel, "Failed to add song", err.message);
		}
	}
};