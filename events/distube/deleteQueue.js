const { Events } = require("distube");
const { EmbedBuilder } = require("discord.js");
const { autoresumeExists, deleteAutoresume } = require("../../controllers/AutoresumeController.js");
const MusicHandler = require("../../handlers/musicHandler.js");
const musicHandler = MusicHandler.getInstance();

module.exports = {
	name: Events.DELETE_QUEUE,
	execute: async (queue, client) => {
		try {
			const PlayerMap = client.PlayerMap;
			const playerintervals = client.playerintervals;

			if(!PlayerMap.has(`deleted-${queue.id}`)) {
				PlayerMap.set(`deleted-${queue.id}`, true);
				if(client.maps.has(`beforeshuffle-${queue.id}`)) {
					client.maps.delete(`beforeshuffle-${queue.id}`);
				}
			}
			try {
				clearInterval(
					playerintervals.get(`autoresume-${queue.id}`),
				);
				await autoresumeExists(queue.id).then(async (data) => {
					await deleteAutoresume(queue.id).catch((e) => {
						console.log(e);
					});
				});
			} catch (e) {
				console.log(`[ERROR] {Events} Failed to clear autoresume interval: ${e.message}`.red);
			}
			musicHandler.cleanupGuild(queue.textChannel.guildId);
		} catch (err) {
			console.log(`[ERROR] {Events} Failed to delete queue: ${err.message}`.red);
			sendErrorMessage(queue.textChannel, "Failed to delete queue", err.message);
		}
	}
};

// Handle deleting autoresumes here