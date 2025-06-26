const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "forward",
	usage: "forward <TimeinSeconds>",
	aliases: ["fwd", "ff", "fastforward"],
	description: "Fast forwards the current song by a specified number of seconds",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("fastforward")
		.setDescription("Fast forwards the current song by a specified number of seconds")
		.addIntegerOption(option =>
			option.setName('time')
				.setDescription('The number of seconds to forward the song')
				.setRequired(true)
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
		const parameter = getQuery(context, 'time');

		await deferResponse(context);

		const ctx = createContextWrapper(context);
		const { member, channelId, guildId, voiceChannel, guild } = ctx;

		if (!hasValidChannel(context, guild, voiceChannel)) return;
		if (!isUserInChannel(context, voiceChannel)) return;
		if (!isQueueValid(context, client, guildId)) return;

		let newQueue = client.distube.getQueue(guildId);

		if (!parameter) {
			sendError(context, "Please provide a time in seconds to forward", `**Usage:**\n> \`${client.settings.get(guildId, "prefix")}forward <TimeinSeconds>\``);
			return;
		}

		let seekNumber = Number(parameter);
		let seekTime = newQueue.currentTime + seekNumber;
		if (seekTime >= newQueue.songs[0].duration) {
			seekTime = newQueue.songs[0].duration - 1; // Prevent seeking beyond the song duration
		}

		await newQueue.seek(seekTime);
		sendFollowUp(context, {
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setTitle("⏩ | Forwarded the song")
				.setDescription(`>>> The song has been forwarded by \`${seekNumber} seconds\` to \`${seekTime} seconds\``)
			]
		});

	} catch (err) {
		console.log(`[ERROR] forward.js: ${err.stack}`.red);
		sendError(context, "Failed to forward the song", err.message);
	}
}