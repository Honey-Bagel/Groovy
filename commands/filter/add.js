const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const FilterSettings = require('../../configs/filters.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "addfilter",
	usage: "addfilter <Filter1> [...]",
	aliases: ["addfilters", "addf"],
	description: "Adds filters to the current voice channel",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("addfilter")
		.setDescription("Adds filters to the current voice channel")
		.addStringOption(option =>
			option.setName('filters')
				.setDescription('The filters you want to add (comma separated)')
				.setRequired(true)
		),

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
		if(!isUserInChannel(context, voiceChannel)) return;
		if(!isQueueValid(context, client, guildId)) return;

		let newQueue = client.distube.getQueue(guildId);

		let filters = getQuery(context, "filters").split(',').map(f => f.trim()).filter(f => f.length > 0);
		if(filters.some(a => !FilterSettings[a])) {
			return sendError(context, "Invalid filter(s) provided", `Available filters: \`${Object.keys(FilterSettings).join('`, `')}\``);
		}

		await newQueue.filters.add(filters);
		return sendFollowUp(context, {
			embeds: [
				new EmbedBuilder()
					.setColor("Green")
					.setTitle(`${client.allEmojis.check_mark} Filters added: \`${filters.join('`, `')}\``)
			]
		});
	} catch (err) {
		console.log(`[ERROR] addfilter.js: ${err.stack}`.red);
		sendError(context, "Failed to add filters", err.message);
		return;
	}
}