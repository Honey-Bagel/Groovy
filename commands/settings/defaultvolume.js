const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const Setting = require('../../models/Settings');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "defaultvolume",
	usage: "defaultvolume <amount>",
	aliases: ["dvolume", "servervolume"],
	description: "Sets the default volume for the server",
	memberpermissions: ["MANAGE_GUILD"],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("defaultvolume")
		.setDescription("Sets the default volume for the server")
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('Volume amount (1-200)')
				.setRequired(true)
				.setMinValue(0)
				.setMaxValue(200)
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
		const parameter = getQuery(context, 'amount');

		await deferResponse(context);

		const ctx = createContextWrapper(context);
		const { member, guildId, guild } = ctx;

		if (!member.permissions.has("MANAGE_GUILD")) {
			return sendError(context, "You do not have permission to manage the server settings.");
		}

		if (!parameter) {
			return sendError(context, "Please provide a valid volume amount for your server");
		}

		let volume = Number(parameter);
		if (!volume || (volume > 200 || volume < 1)) {
			return sendError(context, "Please provide a valid volume amount for your server");
		}

		await Setting.findOneAndUpdate({ _id: guildId }, { defaultVolume: volume }, { upsert: true });

		return sendFollowUp(context, {
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setTitle(`${client.allEmojis.check_mark} Default volume is now set to ${volume}`)
			],
		});
	} catch (err) {
		console.log(`[ERROR] defaultvolume.js: ${err.stack}`.red);
		return sendError(context, "An error occurred while trying to set the default volume", err.message);
	}
}