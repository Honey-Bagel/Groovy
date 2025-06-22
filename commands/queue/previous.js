const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "previous",
	usage: "previous",
	aliases: ["prev", "back", "last", "playlast"],
	description: "Plays the last song that was played in the queue",
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

			if(!newQueue || !newQueue.previousSongs || newQueue.previousSongs.length == 0) {
				await newQueue.stop();
				return message.channel.send({
					embeds: [ new EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setTitle(`${client.allEmojis.x} **No previous songs found**`)
					]
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			await newQueue.previous();
			return message.channel.send({
				embeds: [ new EmbedBuilder()
					.setColor("Green")
					.setTitle("⏮ | Playing the previous song")
					.setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] previous.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to play the previous song", err.message);
		}
	}
};