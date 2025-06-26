const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const Setting = require('../../models/Settings');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "prefix",
	usage: "prefix <new prefix>",
	aliases: ["setprefix", "serverprefix"],
	description: "Sets the prefix for the server",
	memberpermissions: ["MANAGE_GUILD"],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("prefix")
		.setDescription("Sets the prefix for the server")
		.addStringOption(option =>
			option.setName('prefix')
				.setDescription('New prefix for the server (single character)')
				.setRequired(true)
				.setMaxLength(1)
				.setMinLength(1)
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
		const parameter = getQuery(context, 'prefix');

		await deferResponse(context);

		const ctx = createContextWrapper(context);
		const { member, guildId, guild } = ctx;

		if (!member.permissions.has("MANAGE_GUILD")) {
			return sendError(context, "You do not have permission to manage the server settings.");
		}

		if (!parameter) {
			return sendError(context, "Please provide a new prefix for your server");
		}

		let newPrefix = parameter;
		if (newPrefix.length > 1) {
			return sendError(context, "The prefix must be a single character");
		}

		await Setting.findOneAndUpdate({ _id: guildId }, { prefix: newPrefix }, { upsert: true });

		return sendFollowUp(context, {
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setTitle(`${client.allEmojis.check_mark} Prefix is now set to \`${newPrefix}\``)
			],
		});
	} catch (err) {
		console.log(`[ERROR] prefix.js: ${err.stack}`.red);
		sendError(context, "Failed to update this server's prefix", err.message);
	}
}