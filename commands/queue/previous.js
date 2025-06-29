const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");
const MusicHandler = require("../../handlers/musicHandler.js");
const musicHandler = MusicHandler.getInstance();

module.exports = {
	name: "previous",
	usage: "previous",
	aliases: ["prev", "back", "last", "playlast"],
	description: "Plays the last song that was played in the queue",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("previous")
		.setDescription("Plays the last song that was played in the queue"),

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
		const { member, channelId, guildId, voiceChannel, guild } = ctx;

		if (!hasValidChannel(context, guild, voiceChannel)) return;
		if (!isUserInChannel(context, voiceChannel)) return;
		if (!isQueueValid(context, client, guildId)) return;

		let newQueue = client.distube.getQueue(guildId);

		if (!newQueue || !newQueue.previousSongs || newQueue.previousSongs.length === 0) {
			return sendError(context, "No previous songs found", "There are no previous songs to play.");
		}

		await musicHandler.updateQueueMessage(guildId, newQueue);

		await newQueue.previous();
		sendFollowUp(context, {
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setTitle("⏮ | Playing Previous Song")
			]
		});
	} catch (err) {
		console.error(`[ERROR] previous.js: ${err.stack}`.red);
		sendError(context, "An error occurred while executing the command", err.message);
	}
}