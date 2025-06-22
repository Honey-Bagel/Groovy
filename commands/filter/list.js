const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const FilterSettings = require('../../configs/filters.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');

module.exports = {
	name: "listfilters",
	usage: "listfilters",
	aliases: ["listfilter", "filterlist", "filters"],
	description: "Lists the avaiable filters that can be used",
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

			if(!newQueue || !newQueue.songs || newQueue.songs.length == 0 || newQueue.filters.size == -1 || !newQueue.filters) {
				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor("Green")
							.setTitle(`${client.allEmojis.check_mark} All available filters:`)
							.addFields([
								{ name: "**All available Filters:**", value: `${Object.keys(FiltersSettings).map(f => `\`${f}\``).join(", ")} \n\n**Note:**\n> *All filters, starting with custom are having there own Command, please use them to define what custom amount u want!*` }
							])
					]
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			} else {
				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor("Green")
							.addFields([
								{ name: "**All available Filters:**", value: `${Object.keys(FiltersSettings).map(f => `\`${f}\``).join(", ")} \n\n**Note:**\n> *All filters, starting with custom are having there own Command, please use them to define what custom amount u want!*` },
								{ name: "**All __current__ Filters:**", value: `${newQueue.filters && newQueue.filters.size >= 0 ? newQueue.filters.names.map(f => `\`${f}\``).join(", ") : client.allEmojis.x}` },
							])
					],
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}
		} catch (err) {
			console.log(`[ERROR] listfilters.js: ${err.stack}`.red);
			sendErrorMessage(message.channel, "Failed to list filters", err.message);
		}
	}
};