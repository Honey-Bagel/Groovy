const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const Setting = require('../../models/Settings.js');

module.exports = {
	name: "volume",
	usage: "volume <value>",
	aliases: ["vol", "v"],
	description: "Sets the volume of the current song",
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

			if (!args[0]) {
				return message.channel.send({
					embeds: [new EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setTitle(`${client.allEmojis.x} **Current Volume:** ${newQueue.volume}`)
					],
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			let volume = Number(args[0]);

			const maxVolume = await Setting.findOne({ _id: guildId }).then((data) => data.maxVolume);
			if(volume > maxVolume) {
				return message.channel.send({
					embeds: [new EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setTitle(`${client.allEmojis.x} **Volume cannot exceed the maximum limit of ${maxVolume} in this server**`)
					],
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			await newQueue.setVolume(volume);
			message.channel.send({
				embeds: [new EmbedBuilder()
					.setColor("Green")
					.setTitle(`🔊 | Volume set to ${volume}`)
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});

		} catch (err) {
			console.log(`[ERROR] volume.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to set the volume", err.message);
		}
	}
};