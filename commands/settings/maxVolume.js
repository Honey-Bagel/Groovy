const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const Setting = require('../../models/Settings');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "maxVolume",
	usage: "maxVolume <amount>",
	aliases: ["mVolume", "servermaxvolume"],
	description: "Sets the default max volume for the server",
	memberpermissions: ["ManageGuild"],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("maxvolume")
		.setDescription("Sets the default max volume for the server")
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('Max volume amount (1-1000)')
				.setRequired(true)
				.setMinValue(0)
				.setMaxValue(1000)
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

		if (!parameter) {
			return sendError(context, "Please provide a valid volume amount for your server");
		}

		let volume = Number(parameter);
		if (!volume || (volume > 1000 || volume < 1)) {
			return sendError(context, "Please provide a valid volume amount for your server");
		}

		await Setting.findOneAndUpdate({ _id: guildId }, { maxVolume: volume }, { upsert: true });

		return sendFollowUp(context, {
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setTitle(`${client.allEmojis.check_mark} Default max volume is now set to ${volume}`)
			],
		});
	} catch (err) {
		console.log(`[ERROR] maxVolume.js: ${err.stack}`.red);
		sendError(context, "Failed to update this server's default max volume", err.message);
	}
}