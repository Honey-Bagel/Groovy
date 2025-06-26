const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "clear",
	usage: "clear",
	aliases: ["clearqueue", "empty", "flush", "clearq"],
	description: "Clears the current queue of songs (Does not leave the channel)",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("clear")
		.setDescription("Clears the current queue of songs (Does not leave the channel)"),

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

		if (!hasValidChannel(context, guild, voiceChannel)) return;
		if (!isUserInChannel(context, voiceChannel)) return;
		if (!isQueueValid(context, client, guildId)) return;

		let newQueue = client.distube.getQueue(guildId);

		let amount = newQueue.songs.length - 1;
		newQueue.songs = [newQueue.songs[0]];

		return sendFollowUp(context, {
			embeds: [ new EmbedBuilder()
				.setColor("Green")
				.setTitle(`🗑️ | Cleared ${amount} song(s) from the queue`)
			]
		});
	} catch (err) {
		console.log(`[ERROR] clear.js: ${err.stack}`.red);
		sendError(context, "Failed to clear the queue", err.message);
	}
};