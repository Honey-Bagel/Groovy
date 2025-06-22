const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const FilterSettings = require('../../configs/filters.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');

module.exports = {
	name: "addfilter",
	usage: "addfilter <Filter1> [...]",
	aliases: ["addfilters", "addf"],
	description: "Adds filters to the current voice channel",
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

			await newQueue.filters.add(filters);
			return message.channel.send({
				embeds: [
					new EmbedBuilder()
						.setColor("Green")
						.setTitle(`${client.allEmojis.check_mark} Filters added: \`${filters.join('`, `')}\``)
				]
			}).then((msg) => {
				client.embedThen(guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] addfilter.js: ${err.stack}`.red);
			sendErrorMessage(message.channel, "Failed to add filters", err.message);
		}
	}
};