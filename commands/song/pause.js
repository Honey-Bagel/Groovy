const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "pause",
	usage: "pause",
	aliases: ["pa", "wait"],
	description: "Pauses the current song",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("pause")
		.setDescription("Pauses the current song"),

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
		const parameter = getQuery(context, 'song');

		await deferResponse(context);

		const ctx = createContextWrapper(context);
		const { member, channelId, guildId, voiceChannel, guild } = ctx;

		if (!hasValidChannel(context, guild, voiceChannel)) return;
		if (!isUserInChannel(context, voiceChannel)) return;
		if (!isQueueValid(context, client, guildId)) return;

		let newQueue = client.distube.getQueue(guildId);

		if (newQueue.paused) {
			await newQueue.resume();
			sendFollowUp(context, {
				embeds: [new EmbedBuilder()
					.setColor("Green")
					.setTitle("▶ | Resumed the song")
					.setDescription(">>> Song was already paused, so it was resumed")
				]
			});
			return;
		}

		await newQueue.pause();
		sendFollowUp(context, {
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setTitle("⏸ | Paused the song")
			]
		});
	} catch (err) {
		console.log(`[ERROR] pause.js: ${err.stack}`.red);
		sendError(context, "An error occurred while trying to pause the song", err.message);
	}
}