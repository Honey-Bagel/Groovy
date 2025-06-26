const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "shuffle",
	usage: "shuffle",
	aliases: ["mix", "randomize"],
	description: "Shuffles the current song queue",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("shuffle")
		.setDescription("Shuffles the current song queue"),

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

		if (!hasValidChannel(guild, context, voiceChannel)) return;
		if (!isUserInChannel(context, voiceChannel)) return;
		if (!isQueueValid(context, client, guildId)) return;

		let newQueue = client.distube.getQueue(guildId);

		client.maps.set(`beforeshuffle-${newQueue.id}`, newQueue.songs.map(track => track).slice(1));
		await newQueue.shuffle();

		const responseEmbed = new EmbedBuilder()
			.setColor("Green")
			.setTitle(`🔀 | Shuffled ${newQueue.songs.length} songs`);

		return await sendFollowUp(context, { embeds: [responseEmbed] });
	} catch (err) {
		console.error(`[ERROR] shuffle.js: ${err.stack}`.red);
		sendError(context, "An error occurred while shuffling the queue", err.message);
	}
};