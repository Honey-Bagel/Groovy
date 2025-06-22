const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "clear",
	usage: "clear",
	aliases: ["clearqueue", "empty", "flush", "clearq"],
	description: "Clears the current queue of songs (Does not leave the channel)",
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

			if (!newQueue || newQueue.songs.length === 0) {
				return message.channel.send({
					embeds: [new EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setTitle(`${client.allEmojis.x} **No songs in the queue to clear**`)
					]
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			let amount = newQueue.songs.length - 2;
			newQueue.songs = [newQueue.songs[0]];

			return message.channel.send({
				embeds: [new EmbedBuilder()
					.setColor("Green")
					.setTitle(`🗑️ | Cleared ${amount} song(s) from the queue`)
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] clear.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to clear the queue", err.message);
		}
	}
};