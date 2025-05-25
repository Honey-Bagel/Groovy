const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "forward",
	usage: "forward <TimeinSeconds>",
	aliases: ["fwd", "ff", "fastforward"],
	description: "Fast forwards the current song by a specified number of seconds",
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

			if(!args || (args && !args[0])) {
				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor(ee.wrongcolor)
							.setTitle(`${client.allEmojis.x} **Please provide a time in seconds to forward**`)
							.setDescription(`**Usage:**\n> \`forward <TimeinSeconds>\``)
					]
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			let seekNumber = Number(args[0]);
			let seekTime = newQueue.currentTime + seekNumber;
			if(seekTime >= newQueue.songs[0].duration) {
				seekTime = newQueue.songs[0].duration - 1; // Prevent seeking beyond the song duration
			}

			await newQueue.seek(seekTime);
			return message.channel.send({
				embeds: [ new EmbedBuilder()
					.setColor("Green")
					.setTitle("⏩ | Forwarded the song")
					.setDescription(`>>> Forwarded the song by \`${seekTime} seconds\` to \`${newQueue.currentTime}\``)
					.setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});

		} catch (err) {
			console.log(`[ERROR] forward.js: ${err.stack}`.red);
			sendErrorMessage(message.channel, "Failed to forward the song", err.message);
		}
	}
};