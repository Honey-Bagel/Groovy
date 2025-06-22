const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "skip",
	usage: "skip",
	aliases: ["s", "next"],
	description: "Skips the current song",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message, args) => {
		const { member, channelId, guildId } = message;
		const { guild } = member;
		const { channel } = member.voice;

		hasValidChannel(guild, message, channel);
		isUserInChannel(message, channel);

		try {
			let newQueue = client.distube.getQueue(guildId);

			if(!newQueue || !newQueue.songs || newQueue.songs.length == 0) {
				return message.channel.send({
					embeds: [ new EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setTitle(`${client.allEmojis.x} **I am not playing anything**`)
					]
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			// If there are no other songs in the queue, stop the queue
			if(newQueue.songs.length <= 1) {
				await newQueue.stop();
				return message.channel.send({
					embeds: [ new EmbedBuilder()
						.setColor("Green")
						.setTitle("⏭ | Skipped the song")
						.setDescription(">>> There are no more songs to play")
					]
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			await newQueue.skip();
			return message.channel.send({
				embeds: [ new EmbedBuilder()
					.setColor("Green")
					.setTitle("⏭ | Skipped the song")
					.setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});

		} catch (err) {
			console.log(`[ERROR] skip.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to skip the song", err.message);
		}
	}
};