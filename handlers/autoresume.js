const settings = require('../configs/settings.json');
const ee = require('../configs/embed.json');
const DisTube = require('distube');
const { isVoiceChannelEmpty } = require("distube");
const Setting = require('../models/Settings');
const { getAutoresumes, updateAutoresume, deleteAutoresume, getAutoresume, autoresumeExists } = require('../controllers/AutoresumeController');
const fetch = require('isomorphic-unfetch');
const { delay } = require('../handlers/functions');

module.exports = (client) => {
	const distube = client.distube;
	const { PlayerMap, playerintervals } = client;
	try {
		const autoconnect = async () => {
			let guilds = await getAutoresumes().then((data) => {
				data.map((guild) => guild._id);
			});
			console.log(`[INFO] Autoresume > All guilds to autoresume: ${guilds ? guilds : "None"}`.blue);

			if(!guilds || guilds.length == 0) return;

			for(const gId of guilds) {
				try {
					let guild = client.guilds.cache.get(gId);
					if(!guild) {
						deleteAutoresume(gId);
						console.log(`[INFO] Autoresume > Bot was kicked out of guild ${gId}, deleted from database.`.blue);
						continue;
					}
					const data = await getAutoresume(gId);

					// Check if the voice channel exists
					let voiceChannel = guild.channels.cache.get(data.voiceChannel);
					if(!voiceChannel && data.voiceChannel) {
						voiceChannel = (await guild.channels.fetch(data.voiceChannel).catch(() => {
							//
						})) || false;
					}
					if(!voiceChannel || !voiceChannel.members || voiceChannel.members.filter((m) => !m.user.bot && !m.voice.deaf && !m.voice.selfDeaf,).size < 1) {
						deleteAutoresume(gId);
						console.log(`[INFO] Autoresume > Voice Channel is either empty / no Listeners / not found`.blue);
						continue;
					}

					// Check if the text channel exists
					let textChannel = await guild.channels.fetch(data.textChannel);
					if(!textChannel) {
						textChannel = (await guild.channels.fetch(data.textChannel).catch(() => {
							//
						})) || false;
					}
					if(!textChannel) {
						deleteAutoresume(gId);
						console.log(`[INFO] Autoresume > Text Channel not found, deleted from database.`.blue);
						continue;
					}

					// Check if there are tracks to play
					let tracks = data.songs;
					if(!tracks || !tracks[0]) {
						console.log(`[INFO] Autoresume > No tracks found for guild ${gId}`.blue);
						continue;
					}

					const makeTrack = async (track) => {
						return new DisTube.song(
							{
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
							}
						);
					};

					const songURLS = tracks.map((track) => track.url);
					const playlist = await distube.createCustomPlaylist(songURLS, {
						member: client.member,
						properties: { name: "Autoresume-Playlist", source: "custom" },
						parallel: true
					});
					await distube.play(voiceChannel, playlist, {
						textChannel: textChannel,
					});
					let newQueue = client.distube.getQueue(guild.id);

					if(!data.playing) {
						await newQueue.pause();
					}

					await newQueue.seek(data.currentTime);

					await newQueue.setVolume(data.volume);

					if(data.repeatMode && data.repeatMode !== 0) {
						await newQueue.setRepeatMode(data.repeatMode);
					}

					if(data.filters && data.filters.length > 0) {
						await newQueue.setFilter(data.filters, true);
					}

					await delay(settings["auto-resume-delay"] || 1000);
				} catch (e) {
					console.error(`[ERROR] Autoresume > Failed to resume guild ${gId}: ${e.message}`.red);				}
			}
		};

		client.on("ready", () => {
			setTimeout(() => autoconnect(), 2 * client.ws.ping);
		});
	} catch (e) {
		console.error(`[ERROR] Failed to handle auto resume: ${e.message}`.red);
	}
};