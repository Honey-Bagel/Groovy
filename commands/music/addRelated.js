const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "addrelated",
	usage: "addrelated",
	aliases: [],
	description: "Add a similar song to the current song",
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

			let newEmbed = await message.channel.send({
				embeds: [ new EmbedBuilder()
					.setTitle(`🔍 Searching Related Song for... **${newQueue.songs[0].name}**`)
				]
			}).catch((e) => {
				console.log(`[ERROR] addrelated.js: ${e.message}`.red);
				sendErrorMessage(message.channel, "Failed to send message", e.message);
			});

			await newQueue.addRelatedSong();
			await newEmbed.edit({
				embeds: [ new EmbedBuilder()
					.setColor("Green")
					.setTitle(`👍 Added: ** ${ newQueue.songs[newQueue.songs.length - 1].name }`)
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});

		} catch (err) {
			console.log(`[ERROR] addrelated.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to add related song", err.message);
		}
	}
};