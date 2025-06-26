const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "replay",
	usage: "replay",
	aliases: ["restart", "replay-song", "replaytrack"],
	description: "Replays the current song from the beginning",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("replay")
		.setDescription("Replays the current song from the beginning"),

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

		let seekNumber = 0; // Replay from the start
		await newQueue.seek(seekNumber);
		sendFollowUp(context, {
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setTitle("🔁 | Replaying the current song")
				.setDescription(`>>> The song has been replayed from the start.`)
				.setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
			]
		});
		return;
	} catch (err) {
		console.log(`[ERROR] replay.js: ${err.stack}`.red);
		return sendError(context, "An error occurred while trying to replay the song", err.message);
	}
}