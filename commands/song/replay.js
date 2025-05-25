const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "replay",
	usage: "replay",
	aliases: ["restart", "replay-song", "replaytrack"],
	description: "Replays the current song from the beginning",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message) => {
		try {
			const { member, guildId } = message;
			const { guild } = member;
			const { channel } = member.voice;
			hasValidChannel(client, message, channel);
			isUserInChannel(message, channel);
			isQueueValid(client, message);

			let newQueue = client.distube.getQueue(guildId);

			let seekNumber = 0;
			await newQueue.seek(seekNumber);
			return message.channel.send({
				embeds: [ new EmbedBuilder()
					.setColor("Green")
					.setTitle("🔁 | Replaying the current song")
					.setDescription(`>>> The song has been replayed from the start.`)
					.setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] replay.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to replay the song", err.message);
		}
	}
};