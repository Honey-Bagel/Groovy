const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "stop",
	usage: "stop",
	aliases: ["end", "stp", "stopmusic"],
	description: "Stops the current song and **clears** the queue",
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

			queue.stop();

			return message.channel.send({
				embeds: [ new EmbedBuilder()
					.setColor("Green")
					.setTitle("⏹ | Ended the queue")
				]
			}).then((msg) => {
				embedThen(message.guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] stop.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to stop the queue", err.message);
		}
	}
};