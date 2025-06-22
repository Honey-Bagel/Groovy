const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const FilterSettings = require('../../configs/filters.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');

module.exports = {
	name: "clearfilters",
	usage: "clearfilters",
	aliases: ["clearf", "cfilter", "cfilters", "clearfilter"],
	description: "Clears all filters from the current voice channel",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message, args) => {
		const { member, guildId, guild } = message;
		const { channel } = member.voice;

		hasValidChannel(guild, message, channel);
		isUserInChannel(message, channel);

		try {
			let newQueue = client.distube.getQueue(guildId);
			isQueueValid(client, message);

			await newQueue.filters.clear();

			return message.channel.send({
				embeds: [
					new EmbedBuilder()
						.setColor("Green")
						.setTitle(`🗑 Cleared all Filters!`)
				]
			}).then((msg) => {
				client.embedThen(guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] clearfilters.js: ${err.stack}`.red);
			sendErrorMessage(message.channel, "Failed to clear the filters", err.message);
		}
	}
};