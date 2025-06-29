const {
	EmbedBuilder,
	SlashCommandBuilder,
	ContainerBuilder,
	TextInputBuilder,
	TextInputStyle,
	MessageFlags,
	StringSelectMenuBuilder
} = require('discord.js');
const ee = require('../../configs/embed.json');
const Setting = require('../../models/Settings');
const { sendFollowUp, sendError, deferResponse, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "guildsettings",
	usage: "guildsettings",
	aliases: ["gsettings", "serversettings", "guildconfig", "serverconfig"],
	description: "View & edit the bot settings for your server",
	memberpermissions: ["ManageGuild"],
	requiredroles: [],
	alloweduserids: [],
	disabled: true,
	data: new SlashCommandBuilder()
		.setName("guildsettings")
		.setDescription("View & edit the bot settings for your server"),

	execute: async (client, message) => {
		return executeCommand(client, { message });
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

		const { member, guildId, guild } = ctx;

		const settings = await Setting.findById({ _id: guildId }).catch(() => {
			/* Ignore */
		});

		if(!settings) {
			return sendError(context, "No settings found for this server", "Please dm the bot for help with this issue");
		}

		const { deleteAfter, deleteBotMessages, deleteUserMessages } = settings;

		console.log(settings);

		const guildSettingsContainer = new ContainerBuilder()
			.setAccentColor(0x0099FF)
			.addSeparatorComponents(
				separator => separator
			)
			.addActionRowComponents(
				actionRow => actionRow
					.setComponents(
						new StringSelectMenuBuilder()
							.setCustomId("deleteBotMessage")
							.setOptions(
								{ label: "Yes", value: "true", default: deleteBotMessages },
								{ label: "No", value: "false", default: !deleteBotMessages }
							)
					)
			)
			.addActionRowComponents(
				actionRow2 => actionRow2
					.setComponents(
						new StringSelectMenuBuilder()
							.setCustomId("deleteUserMessage")
							.setOptions(
								{ label: "Yes", value: "true", default: deleteUserMessages },
								{ label: "No", value: "false", default: !deleteUserMessages }
							)
					)
			);

		await sendFollowUp(context, {
			components: [ guildSettingsContainer ],
			flags: MessageFlags.IsComponentsV2
		});

	} catch (err) {
		console.log(`[ERROR] guildsettings.js: ${err.stack}`.red);
		return sendError(context, "An error occurred trying to view guild settings", err.message);
	}
}