const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "loop",
	usage: "loop <song/queue/off>",
	aliases: ["repeat", "repeatmode"],
	description: "Enable/Disable the Song- / Queue-Loop",
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

			if(!args[0]) {
				return message.channel.send({
					embeds: [new EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setTitle(`${client.allEmojis.x} **Please specify a loop mode!**`)
						.setDescription(`**Usage:**\n> \`${client.settings.get(message.guild.id, "prefix")}loop <song/queue/off>\``)
					],
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			let loop = String(args[0]).toLowerCase();
			if(!["song", "queue", "off"].includes(loop)) {
				return message.channel.send({
					embeds: [new EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setTitle(`${client.allEmojis.x} **Invalid loop mode!**`)
						.setDescription(`**Please specify one of the following modes:**\n> \`song\`, \`queue\`, \`off\``)
					]
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			switch(loop) {
			case "song":
				loop = 1;
				break;
			case "queue":
				loop = 2;
				break;
			case "off":
				loop = 0;
				break;
			}

			await newQueue.setRepeatMode(loop);
			return message.channel.send({
				embeds: [new EmbedBuilder()
					.setColor("Green")
					.setTitle(`${client.allEmojis.check_mark} **Loop mode set to:** \`${loop === 1 ? "Song" : loop === 2 ? "Queue" : "Off"}\``)
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] loop.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to set the loop mode", err.message);
		}
	}
};