const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const MusicHandler = require("../../handlers/musicHandler.js");
const musicHandler = MusicHandler.getInstance();
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "list",
	usage: "list",
	aliases: ["queue", "q", "songs", "queuelist"],
	description: "Displays the current song queue",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("list")
		.setDescription("Displays the current song queue"),

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

		const { member, guildId, guild, voiceChannel } = ctx;

		if(!hasValidChannel(context, guild, voiceChannel)) return;
		if(!isUserInChannel(context, voiceChannel)) return;
		if(!isQueueValid(context, client, guildId)) return;

		let newQueue = client.distube.getQueue(guildId);

		await sendFollowUp(context, { content: "Retrieving queue data..." }, 1);

		return musicHandler.updateQueueMessage(guildId, newQueue);
	} catch (err) {
		console.log(`[ERROR] list.js: ${err.stack}`.red);
		sendError(context, "Failed to retrieve the song queue", err.message);
	}
}