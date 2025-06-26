const { EmbedBuilder, SlashCommandBuilder, Embed } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "stop",
	usage: "stop",
	aliases: ["end", "stp", "stopmusic"],
	description: "Stops the current song and **clears** the queue",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("stop")
		.setDescription("stops the current song and clears the queue"),
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

		const { voiceChannel, guild, message } = ctx;

		const queue = client.distube.getQueue(guild.id);

		if(!hasValidChannel(context, guild, voiceChannel)) return;
		if(!isUserInChannel(context, voiceChannel)) return;
		if(!isQueueValid(context, client, guild.id)) return;

		queue.stop();

		const embed = new EmbedBuilder()
			.setColor("Green")
			.setTitle("⏹ | Ended the queue");

		sendFollowUp(context, { embeds: [ embed ] });
	} catch (err) {
		console.log(`[ERROR] stop.js: ${err.stack}`.red);
		sendErrorMessage(context.channel, "Failed to stop the queue", err.message);
	}
}