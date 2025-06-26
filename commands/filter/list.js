const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const FilterSettings = require('../../configs/filters.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "listfilters",
	usage: "listfilters",
	aliases: ["listfilter", "filterlist", "filters"],
	description: "Lists the avaiable filters that can be used",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("listfilters")
		.setDescription("Lists the available filters that can be used"),

	execute: async (client, message, args) => {
		return executeCommand(client, { message, args });
	},

	executeSlash: async (client, interaction) => {
		return executeCommand(client, { interaction });
	}
};

async function executeCommand(client, context) {
	try {
		const isSlash = isSlashCommand(context);

		await deferResponse(context);

		const ctx = createContextWrapper(context);

		const { member, guildId, guild, voiceChannel } = ctx;

		if(!hasValidChannel(context, guild, voiceChannel)) return;
		if(!hasValidChannel(context, guild, voiceChannel)) return;

		let newQueue = client.distube.getQueue(guildId);

		if(!newQueue || !newQueue.songs || newQueue.songs.length == 0 || newQueue.filters.size == -1 || !newQueue.filters) {
			return sendFollowUp(context, {
				embeds: [
					new EmbedBuilder()
						.setColor("Green")
						.addFields([
							{ name: "**All available Filters:**", value: `${Object.keys(FilterSettings).map(f => `\`${f}\``).join(", ")} \n\n**Note:**\n> *All filters, starting with custom are having there own Command, please use them to define what custom amount u want!*` }
						])
				]
			}, 20000);
		} else {
			return sendFollowUp(context, {
				embeds: [
					new EmbedBuilder()
						.setColor("Green")
						.addFields([
							{ name: "**All available Filters:**", value: `${Object.keys(FilterSettings).map(f => `\`${f}\``).join(", ")} \n\n**Note:**\n> *All filters, starting with custom are having there own Command, please use them to define what custom amount u want!*` },
							{ name: "**All __current__ Filters:**", value: `${newQueue.filters && newQueue.filters.size >= 0 ? newQueue.filters.names.map(f => `\`${f}\``).join(", ") : client.allEmojis.x}` },
						])
				]
			}, 20000);
		}
	} catch (err) {
		console.log(`[ERROR] listfilters.js: ${err.stack}`.red);
		sendError(context, "Failed to list filters", err.message);
		return;
	}
}