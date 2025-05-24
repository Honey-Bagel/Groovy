const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "autoplay",
	usage: "autoplay",
	aliases: ["ap"],
	description: "Toggles autoplay",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message) => {
		try {
			const { member, guildId } = message;
			const { guild } = member;
			const { channel } = member.voice;

			hasValidChannel(guild, message, channel);
			isUserInChannel(message, channel);
			isQueueValid(client, message);

			let newQueue = client.distube.getQueue(guildId);

			await newQueue.toggleAutoplay();
			return message.channel.send({
				embeds: [ new EmbedBuilder()
					.setColor("Green")
					.setTitle("🔁 | Autoplay is now " + (newQueue.autoplay ? "enabled" : "disabled"))
					.setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] autoplay.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to toggle autoplay", err.message);
		}
	}
};