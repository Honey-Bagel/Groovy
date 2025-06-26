const { Events } = require("distube");
const { EmbedBuilder } = require("discord.js");
const { sendErrorMessage } = require("../../handlers/functions.js");
const MusicHandler = require("../../handlers/musicHandler.js");
const musicHandler = MusicHandler.getInstance();

module.exports = {
	name: Events.ERROR,
	execute: (e, queue) => {
		try {
			console.log('testing'.yellow);
			sendErrorMessage(queue.textChannel, "{DISTUBE} An error occured", e.message);
			console.log(`[ERROR] {Events} An error occured: ${e.message}`.red);

			musicHandler.stopTimer(queue.textChannel.guildId);
		} catch (err) {
			console.log(`[ERROR] {Events} Failed to handle error: ${err.message}`.red);
			sendErrorMessage(queue.textChannel, "{DISTUBE} An error occured", err.message);
		}
	}
};