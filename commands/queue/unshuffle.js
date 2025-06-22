const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "unshuffle",
	usage: "unshuffle",
	aliases: ["unmix"],
	description: "Unshuffles the queue",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message) => {
		const { member, channelId, guildId } = message;
		const { guild } = member;
		const { channel } = member.voice;

		hasValidChannel(guild, message, channel);
		isUserInChannel(message, channel);
		isQueueValid(client, message);

		try {
			let newQueue = client.distube.getQueue(guildId);

			if(!client.maps.has(`beforeshuffle-${newQueue.id}`)) {
				return message.channel.send({
					embeds: [new EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setTitle(`${client.allEmojis.x} **No previous shuffle state found!**`)
						.setDescription("Please shuffle the queue first before trying to unshuffle it.")
					],
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			const unshuffled = client.maps.get(`beforeshuffle-${newQueue.id}`);
			const currentSongs = new Map();
			newQueue.songs.forEach(song => {
				currentSongs.set(song.url || song.id, song);
			});

			const unshuffledQueue = [];

			for(const originalSong of unshuffled) {
				const songKey = originalSong.url || originalSong.id;
				if(currentSongs.has(songKey)) {
					unshuffledQueue.push(originalSong);
					currentSongs.delete(songKey);
				}
			}

			for(const song of newQueue.songs) {
				const songKey = song.url || song.id;
				if(currentSongs.has(songKey)) {
					unshuffledQueue.push(song);
				}
			}

			newQueue.songs = [newQueue.songs[0], unshuffledQueue];

			return message.channel.send({
				embeds: [new EmbedBuilder()
					.setColor("Green")
					.setTitle(`🔄 | Unshuffled the queue, now has ${newQueue.songs.length} songs`)
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] unshuffle.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to unshuffle the queue", err.message);
		}
	}
};