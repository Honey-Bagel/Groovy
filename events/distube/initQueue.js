const { Events } = require("distube");
const { EmbedBuilder } = require("discord.js");
const { sendErrorMessage } = require("../../handlers/functions.js");
const MusicHandler = require("../../handlers/musicHandler.js");
const musicHandler = MusicHandler.getInstance();
const { updateAutoresume, getAutoresume } = require("../../controllers/AutoresumeController.js");
const { getSetting } = require("../../controllers/SettingController.js");
const settings = require('../../configs/settings.json');
const Setting = require("../../models/Settings.js");

module.exports = {
	name: Events.INIT_QUEUE,
	execute: async (queue, client) => {
		const PlayerMap = client.PlayerMap;
		const playerintervals = client.playerintervals;
		try {
			if(PlayerMap.has(`deleted-${queue.id}`)) {
				PlayerMap.delete(`deleted-${queue.id}`);
			}
			let data = await Setting.findOne({ _id: queue.id });

			queue.autoplay = Boolean(data.defaultautoplay);
			queue.volume = Number(data.defaultVolume);

			// Handle Autoresuming

			let autoresumeinterval = setInterval(async () => {
				let newQueue = client.distube.getQueue(queue.id);
				if(newQueue && newQueue.id && await getSetting(queue.id).then((settingData) => {
					return settingData.autoresume;
				})) {
					const makeTrackData = (track) => {
						return {
							source: track.source,
							duration: track.duration,
							formattedDuration: track.formattedDuration,
							id: track.id,
							isLive: track.isLive,
							name: track.name,
							thumbnail: track.thumbnail,
							type: "video",
							uploader: track.uploader,
							url: track.url,
							views: track.views,
						};
					};

					await updateAutoresume(queue.id, {
						voiceChannel: newQueue.voiceChannel ? newQueue.voiceChannel.id : null,
						textChannel: newQueue.textChannel,
						songs: newQueue.songs && newQueue.songs.length > 0 ? [...newQueue.songs].map((track) => makeTrackData(track)) : null,
						volume: newQueue.volume,
						repeatMode: newQueue.repeatMode,
						playing: newQueue.playing,
						currentTime: newQueue.currentTime,
						filters: [...newQueue.filters.values].filter(Boolean),
						autoplay: newQueue.autoplay,
					}, true);

					data = await getAutoresume(newQueue.id);


				}
			}, settings["auto-resume-save-cooldown"] || 5000);
			playerintervals.set(`autoresumeinterval-${queue.id}`, autoresumeinterval);
		} catch (err) {
			console.log(`[ERROR] {Events} Failed to init queue: ${err.message}`.red);
			sendErrorMessage(queue.textChannel, "Failed to init queue", err.message);
		}
	}
};