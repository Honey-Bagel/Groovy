const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const Setting = require('../../models/Settings');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "autoresume",
	usage: "autoresume [true/false]",
	aliases: ["aresume"],
	description: "Enable or disable auto-resume setting for the server",
	memberpermissions: ["ManageGuild"],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("autoresume")
		.setDescription("Enable or disable auto-resume setting for the server")
		.addStringOption(option =>
			option.setName('autoresume')
				.setDescription('Set auto-resume to true or false')
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
		let parameter = getQuery(context, 'autoresume');

		await deferResponse(context);

		const ctx = createContextWrapper(context);
		const { member, guildId, guild } = ctx;

		const prevValue = await Setting.findOne({ _id: guildId }).then((data) => data.autoresume);

		if (!parameter) {
			await Setting.findOneAndUpdate({ _id: guildId }, { autoresume: !prevValue }, { upsert: true });
			return sendFollowUp(context, {
				embeds: [new EmbedBuilder()
					.setColor("Green")
					.setTitle(`${client.allEmojis.check_mark} Auto-resume is now ${!prevValue ? "enabled" : "disabled"}`)
				],
			});
		} else {
			parameter = parameter.trim();
			if (parameter.toLowerCase() === "true" || parameter.toLowerCase() === "false") {
				const newValue = parameter.toLowerCase() === "true";
				if (newValue !== prevValue) {
					await Setting.findOneAndUpdate({ _id: guildId }, { autoresume: newValue }, { upsert: true });
					return sendFollowUp(context, {
						embeds: [new EmbedBuilder()
							.setColor("Green")
							.setTitle(`${client.allEmojis.check_mark} Auto-resume is now ${newValue ? "enabled" : "disabled"}`)
						],
					});
				} else {
					return sendFollowUp(context, {
						embeds: [new EmbedBuilder()
							.setColor("Green")
							.setTitle(`${client.allEmojis.check_mark} Auto-resume is already ${newValue ? "enabled" : "disabled"}`)
						]
					});
				}
			}
			return sendError(context, "Invalid parameter.", "Use `true` or `false` to set the auto-resume option.");
		}
	} catch (err) {
		console.log(`[ERROR] autoresume.js: ${err.stack}`.red);
		return sendError(context, "An error occurred while trying to update the auto-resume setting", err.message);
	}
}