const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage } = require('../../handlers/functions.js');

module.exports = {
	name: "resume",
	usage: "resume",
	aliases: ["unpause", "continue"],
	description: "Resumes the current song if it is paused",
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

			if(!queue.paused) {
				return;
			}

			await queue.resume();
			message.channel.send({
				embeds: [ new EmbedBuilder()
					.setColor("Green")
					.setTitle("▶️ | Resumed the song")
				]
			}).then((msg) => {
				embedThen(message.guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] resume.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to resume the song", err.message);
		}
	}
};