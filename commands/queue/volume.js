const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const Setting = require('../../models/Settings.js');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "volume",
	usage: "volume <value>",
	aliases: ["vol", "v"],
	description: "Sets the volume of the current song",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("volume")
		.setDescription("Sets the volume of the current song")
		.addIntegerOption(option =>
			option.setName('value')
				.setDescription('The volume level to set (0-100)')
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
		await deferResponse(context);

		const ctx = createContextWrapper(context);
		const { member, channelId, guildId, voiceChannel, guild } = ctx;

		if (!hasValidChannel(guild, context, voiceChannel)) return;
		if (!isUserInChannel(context, voiceChannel)) return;
		if (!isQueueValid(context, client, guildId)) return;

		let newQueue = client.distube.getQueue(guildId);

		if (!newQueue) {
			return sendError(context, "No active queue found", "Please start playing a song first.");
		}

		const volume = getQuery(context, 'value');
		if (!volume) {
			return sendError(context, "Please provide a volume level", `**Usage:**\n> \`${client.settings.get(guildId, "prefix")}volume <value>\``);
		}

		await newQueue.setVolume(Number(volume));
		return sendFollowUp(context, {
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setTitle(`🔊 | Volume set to ${volume}`)
			]
		});

	} catch (err) {
		console.error(`[ERROR] volume.js: ${err.stack}`.red);
		sendError(context, "An error occurred while setting the volume", err.message);
	}
}