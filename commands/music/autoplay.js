const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "autoplay",
	usage: "autoplay",
	aliases: ["ap"],
	description: "Toggles autoplay",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("autoplay")
		.setDescription("Toggles autoplay"),

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

		await newQueue.toggleAutoplay();

		const embed = new EmbedBuilder()
			.setColor("Green")
			.setTitle("🔁 | Autoplay is now " + (newQueue.autoplay ? "enabled" : "disabled"));

		return sendFollowUp(context, { embeds: [ embed ] });
	} catch (err) {
		console.log(`[ERROR] autoplay.js: ${err.stack}`.red);
		sendError(context, "Failed to toggle autoplay", err.message);
	}
}