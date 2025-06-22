const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const MusicHandler = require("../../handlers/musicHandler.js");
const musicHandler = MusicHandler.getInstance();

module.exports = {
	name: "list",
	usage: "list",
	aliases: ["queue", "q", "songs", "queuelist"],
	description: "Displays the current song queue",
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

			await message.delete().catch(() => {//
			//
			});
			return musicHandler.updateQueueMessage(guildId, newQueue);
		} catch (err) {
			console.log(`[ERROR] list.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to retrieve the song queue", err.message);
		}
	}
};