const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "leave",
	usage: "leave",
	aliases: ["disconnect", "die", "dc", "fuckoff", "kys"],
	description: "Leaves the voice channel and stops playing music",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message) => {
		try {
			const { channel } = message.member.voice;
			const queue = client.distube.getQueue(message);

			hasValidChannel(message.guild, message, channel);
			isUserInChannel(message, channel);
			isQueueValid(client, message);

			await client.distube.voices.leave(message.guild);
			return message.channel.send({
				embeds: [ new EmbedBuilder()
					.setColor("Green")
					.setTitle("👋 Bye")
				]
			}).then((msg) => {
				embedThen(message.guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] leave.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to leave the voice channel", err.message);
		}
	}
};