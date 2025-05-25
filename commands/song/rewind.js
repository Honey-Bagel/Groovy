const { EmbedBuilder } = require("discord.js");
const ee = require("../../configs/embed.json");
const { hasValidChannel, isUserInChannel, isQueueValid } = require("../../handlers/functions.js");
const { sendErrorMessage, embedThen } = require("../../handlers/functions.js");

module.exports = {
	name: "rewind",
	usage: "rewind <TimeinSeconds>",
	aliases: ["rwd"],
	description: "Rewinds by specified number of seconds",
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

			if(!args[0]) {
				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor(ee.wrongcolor)
							.setTitle(`${client.allEmojis.x} **Please provide a time in seconds to rewind**`)
							.setDescription(`**Usage:**\n> \`rewind <TimeinSeconds>\``)
					]
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			let seekNumber = Number(args[0]);
			let seekTime = newQueue.currentTime - seekNumber;
			if(seekTime < 0) {
				seekTime = 0; // Prevent seeking before the start of the song
			}

			await newQueue.seek(seekTime);
			return message.channel.send({
				embeds: [ new EmbedBuilder()
					.setColor("Green")
					.setTitle("⏪ | Rewound the song")
					.setDescription(`>>> Rewound the song by \`${seekNumber} seconds\` to \`${newQueue.formattedCurrentTime}\``)
					.setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});
		} catch (err) {
			console.error(`[ERROR] rewind.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to rewind the song", err.message);
		}
	}
};