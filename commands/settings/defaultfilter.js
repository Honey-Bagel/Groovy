const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const filters = require('../../configs/filters.json');
const Setting = require('../../models/Settings');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "defaultfilter",
	usage: "defaultfilter <filter1 filter2 ...>",
	aliases: ["dfilter"],
	description: "Defines the default filters for the server. Use 'none' to remove all default filters.",
	memberpermissions: ["ManageGuild"],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("defaultfilter")
		.setDescription("Defines the default filters for the server. Use 'none' to remove all default filters.")
		.addStringOption(option =>
			option.setName('filters')
				.setDescription('List of filters to set as default, or "none" to remove all defaults')
				.setRequired(false)
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
		const parameter = getQuery(context, 'filters');

		await deferResponse(context);

		const ctx = createContextWrapper(context);
		const { member, guildId, guild } = ctx;

		if (parameter === "none") {
			await Setting.findOneAndUpdate({ _id: guildId }, { defaultfilters: [] }, { upsert: true });
			return sendFollowUp(context, {
				embeds: [new EmbedBuilder()
					.setColor("Green")
					.setTitle(`${client.allEmojis.check_mark} All Default Filters have been removed`)
				],
			});
		}

		const filtersToSet = parameter.split(" ").filter(f => filters[f]);
		if (filtersToSet.length === 0) {
			return sendError(context, "No valid filters provided. Please provide valid filter names.");
		}

		await Setting.findOneAndUpdate({ _id: guildId }, { defaultfilters: filtersToSet }, { upsert: true });

		return sendFollowUp(context, {
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setTitle(`${client.allEmojis.check_mark} The new Default Filters are:`)
				.setDescription(filtersToSet.map(f => `\`${f}\``).join(", "))
			],
		});
	} catch (err) {
		console.log(`[ERROR] defaultfilter.js: ${err.stack}`.red);
		return sendError(context, "An error occurred while trying to set the default filters", err.message);
	}
}