const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const Setting = require('../../models/Settings');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "autoplay",
	usage: "autoplay [true/false]",
	aliases: ["dautoplay"],
	description: "Enable or disable the default autoplay setting for the server",
	memberpermissions: ["MANAGE_GUILD"],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("defaultautoplay")
		.setDescription("Enable or disable the default autoplay setting for the server")
		.addStringOption(option =>
			option.setName('autoplay')
				.setDescription('Set autoplay to true or false')
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
		const parameter = getQuery(context, 'autoplay');

		await deferResponse(context);

		const ctx = createContextWrapper(context);
		const { member, guildId, guild } = ctx;

		if (!member.permissions.has("MANAGE_GUILD")) {
			return sendError(context, "You do not have permission to manage the server settings.");
		}

		const prevValue = await Setting.findOne({ _id: guildId }).then((data) => data.defaultautoplay);

		if (!parameter) {
			await Setting.findOneAndUpdate({ _id: guildId }, { defaultautoplay: !prevValue }, { upsert: true });
			return sendFollowUp(context, {
				embeds: [new EmbedBuilder()
					.setColor("Green")
					.setTitle(`${client.allEmojis.check_mark} Default Autoplay is now ${!prevValue ? "enabled" : "disabled"}`)
				],
			});
		} else {
			if (parameter.toLowerCase() === "true" || parameter.toLowerCase() === "false") {
				const newValue = parameter.toLowerCase() === "true";
				if (newValue !== prevValue) {
					await Setting.findOneAndUpdate({ _id: guildId }, { defaultautoplay: newValue }, { upsert: true });
					return sendFollowUp(context, {
						embeds: [new EmbedBuilder()
							.setColor("Green")
							.setTitle(`${client.allEmojis.check_mark} Default Autoplay is now ${newValue ? "enabled" : "disabled"}`)
						],
					});
				} else {
					return sendFollowUp(context, {
						embeds: [new EmbedBuilder()
							.setColor("Green")
							.setTitle(`${client.allEmojis.check_mark} Default Autoplay is already ${prevValue ? "enabled" : "disabled"}`)
							.setDescription(`Current setting: \`${prevValue}\`\nTo change it, use the command with a different value.`)
						],
					});
				}
			}
		}
	} catch (err) {
		console.log(`[ERROR] defaultautoplay.js: ${err.stack}`.red);
		return sendError(context, "An error occurred while trying to update the autoplay setting", err.message);
	}
}