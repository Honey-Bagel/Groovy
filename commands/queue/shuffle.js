const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "shuffle",
	usage: "shuffle",
	aliases: ["mix", "randomize"],
	description: "Shuffles the current song queue",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message) => {
		const { member, channelId, guildId } = message;
		const { guild } = member;
		const { channel } = member.voice;

		hasValidChannel(guild, message, channel);
		isUserInChannel(message, channel);
		isQueueValid(client, message);

		try {
			let newQueue = client.distube.getQueue(guildId);

			client.maps.set(`beforeshuffle-${newQueue.id}`, newQueue.songs.map(track => track).slice(1));
			await newQueue.shuffle();
			return message.channel.send({
				embeds: [new EmbedBuilder()
					.setColor("Green")
					.setTitle(`🔀 | Shuffled ${newQueue.songs.length} songs`)
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] shuffle.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to shuffle the queue", err.message);
		}
	}
};