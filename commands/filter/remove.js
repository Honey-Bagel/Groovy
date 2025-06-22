const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const FilterSettings = require('../../configs/filters.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');

module.exports = {
	name: "removefilter",
	usage: "removefilter <filter1> [...]",
	aliases: ["removefilters", "removef"],
	description: "Removes filters from the current voice channel",
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

			let filters = args;
			if(filters.some(a => !FiltersSettings[a])) {
				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor(ee.wrongcolor)
							.setTitle(`${client.allEmojis.error} Invalid filter(s) provided`)
							.setDescription(`Available filters: \`${Object.keys(FilterSettings).join('`, `')}\``)
					]
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			await newQueue.filters.remove(filters);
			return message.channel.send({
				embeds: [
					new EmbedBuilder()
						.setColor("Green")
						.setTitle(`${client.allEmojis.check_mark} Removed ${filters.length} filter(s)`)
				]
			}).then((msg) => {
				client.embedThen(guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] removefilters.js: ${err.stack}`.red);
			sendErrorMessage(message.channel, "Failed to remove filters", err.message);
		}
	}
};