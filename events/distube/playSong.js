const { Events } = require("distube");
const { sendErrorMessage } = require("../../handlers/functions.js");
const MusicHandler = require("../../handlers/musicHandler.js");
const musicHandler = MusicHandler.getInstance();

module.exports = {
	name: Events.PLAY_SONG,
	execute: async (queue, track, client) => {
		try {
			if(!client.guilds.cache.get(queue.id).members.me.voice.deaf) {
				client.guilds.cache.get(queue.id).me.voice.setDeaf(true).catch((e) => {
					//
				});
			}
		} catch (err) {
			console.log(`[ERROR] {Events} Failed to play song: ${err.message}`.red);
			sendErrorMessage(queue.textChannel, "Failed to play song", err.message);
		}
		try {
			const guildId = queue.textChannel?.guild.id;

			musicHandler.updateGuildData(guildId, {
				textChannel: queue.textChannel,
			});

			await musicHandler.updateNowPlayingMessage(guildId, track, queue);
			await musicHandler.updateQueueMessage(guildId, queue);
			musicHandler.startTimer(guildId);


		} catch (err) {
			console.log(`[ERROR] {Events} Failed to play song: ${err.message}`.red);
			sendErrorMessage(queue.textChannel, "Failed to play song", err.message);
		}
	}
};