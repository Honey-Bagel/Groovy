const { Events } = require("distube");
const MusicHandler = require("../../handlers/musicHandler.js");
const musicHandler = MusicHandler.getInstance();

module.exports = {
	name: Events.DISCONNECT,
	execute: async (queue, client) => {
		try {
			musicHandler.cleanupGuild(queue.textChannel.guildId);
		} catch (err) {
			console.log(`[ERROR] {Events} Failed to disconnect: ${err.message}`.red);
			sendErrorMessage(queue.textChannel, "Failed to disconnect", err.message);
		}
	}
};