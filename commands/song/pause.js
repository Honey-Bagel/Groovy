const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "pause",
	usage: "pause",
	aliases: ["pa", "wait"],
	description: "Pauses the current song",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message) => {
		try {
			const queue = client.distube.getQueue(message);
			const { channel } = message.member.voice;

			hasValidChannel(message.guild, message, channel);
			isUserInChannel(message, channel);
			isQueueValid(client, message);

			if(queue.paused) {
				await queue.resume();
				return message.channel.send({
					embeds: [ new EmbedBuilder()
						.setColor("Green")
						.setTitle("▶ | Resumed the song")
						.setDescription(">>> Song was already paused, so it was resumed")
					]
				}).then((msg) => {
					embedThen(message.guildId, msg, message);
				});
			}

			await queue.pause();
			message.channel.send({
				embeds: [ new EmbedBuilder()
					.setColor("Green")
					.setTitle("⏸ | Paused the song")
				]
			}).then((msg) => {
				embedThen(message.guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] pause.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to pause the song", err.message);
		}
	}
};