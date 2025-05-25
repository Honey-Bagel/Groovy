const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "seek",
	usage: "seek <TimeinSeconds>",
	aliases: ["sek", "goto"],
	description: "Seeks to a specified time in the current song",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message, args) => {
		try {
			const { member, guildId } = message;
			const { guild } = member;
			const { channel } = member.voice;

			hasValidChannel(client, message, channel);
			isUserInChannel(message, channel);
			isQueueValid(client, message);

			let newQueue = client.distube.getQueue(guildId);

			if (!args[0]) {
				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor(ee.wrongcolor)
							.setTitle(`${client.allEmojis.x} **Please provide a time in seconds to seek to**`)
							.setDescription(`**Usage:**\n> \`seek <TimeinSeconds>\``)
					]
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			let seekNumber = Number(args[0]);
			if(seekNumber > newQueue.songs[0].duration || seekNumber < 0) {
				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor(ee.wrongcolor)
							.setFooter({ text: ee.footertext, iconURL: ee.footericon })
							.setTitle(`${client.allEmojis.x} **Invalid seek time**`)
							.setDescription(`Please provide a valid time in seconds between \`0\` and \`${newQueue.songs[0].duration}\``)
					]
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			await newQueue.seek(seekNumber);
			return message.channel.send({
				embeds: [new EmbedBuilder()
					.setColor("Green")
					.setTitle(`⏩ Seeked to \`${seekNumber} seconds\``)
					.setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});
		} catch (err) {
			console.error(`[ERROR] Failed to seek in song: ${err.message}`.red);
			return sendErrorMessage(message.channel, `Failed to seek in song`, err.message);
		}
	}
};