const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "move",
	usage: "move <from> <to>",
	aliases: ["swap", "switch"],
	description: "Moves a song from one position to another in the queue",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message, args) => {
		const { member, channelId, guildId } = message;
		const { guild } = member;
		const { channel } = member.voice;

		hasValidChannel(guild, message, channel);
		isUserInChannel(message, channel);
		isQueueValid(client, message);

		try {
			let newQueue = client.distube.getQueue(guildId);

			if(!args[0] || !args[1]) {
				return message.channel.send({
					embeds: [new EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setTitle(`${client.allEmojis.x} **Please provide both positions to move the song!**`)
						.setDescription(`**Usage:**\n> \`${client.settings.get(message.guild.id, "prefix")}move <from> <to>\``)
					],
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			let from = Number(args[0]);
			let to = Number(args[1]);

			if(from > newQueue.songs.length || from < 1 || to > newQueue.songs.length || to < 1 || from === to) {
				return message.channel.send({
					embeds: [new EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setTitle(`${client.allEmojis.x} **Invalid positions provided!**`)
						.setDescription(`**Valid range:** 1 - ${newQueue.songs.length}`)
					],
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			let song = newQueue.songs[from];
			newQueue.songs[from] = newQueue.songs[to];
			newQueue.songs[to] = song;

			return message.channel.send({
				embeds: [new EmbedBuilder()
					.setColor("Green")
					.setTitle(`🔄 | Moved song from position ${from} to ${to}`)
					.setDescription(`**Moved:** \`${song.name}\` by \`${song.uploader.name}\``)
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] move.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to move the song in the queue", err.message);
		}
	}
};