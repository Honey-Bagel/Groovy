const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendFollowUp, deferResponse, isSlashCommand, createContextWrapper } = require('../../utils/commandUtils.js');

module.exports = {
	name: "leave",
	usage: "leave",
	aliases: ["disconnect", "die", "dc", "fuckoff", "kys"],
	description: "Leaves the voice channel and stops playing music",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("leave")
		.setDescription("Leaves the voice channel and stops playing music"),

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

		const { voiceChannel, message } = ctx;
		const queue = client.distube.getQueue(ctx.guildId);

		if(!hasValidChannel(context, ctx.guild, voiceChannel)) return;
		if(!isUserInChannel(context, voiceChannel)) return;

		await client.distube.voices.leave(ctx.guild);

		const embed = new EmbedBuilder()
			.setColor("Green")
			.setTitle("👋 Bye");

		sendFollowUp(context, { embeds: [ embed ] });
	} catch (err) {
		console.error(`[ERROR] leave.js: ${err.stack}`.red);
		sendError(context, "Failed to leave the voice channel", err.message, client);
	}
}