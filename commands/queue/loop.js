const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "loop",
	usage: "loop <song/queue/off>",
	aliases: ["repeat", "repeatmode"],
	description: "Enable/Disable the Song- / Queue-Loop",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("loop")
		.setDescription("Enable/Disable the Song- / Queue-Loop")
		.addStringOption(option =>
			option.setName('mode')
				.setDescription('The loop mode to set (song/queue/off)')
				.setRequired(true)
				.addChoices(
					{ name: 'Song', value: 'song' },
					{ name: 'Queue', value: 'queue' },
					{ name: 'Off', value: 'off' }
				)
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

		await deferResponse(context);

		const ctx = createContextWrapper(context);

		const { member, channelId, guildId, voiceChannel, guild } = ctx;

		if (!hasValidChannel(context, guild, voiceChannel)) return;
		if (!isUserInChannel(context, voiceChannel)) return;
		if (!isQueueValid(context, client, guildId)) return;

		let newQueue = client.distube.getQueue(guildId);
		let parameter = getQuery(context, 'mode');

		if (!parameter || parameter.length === 0) {
			return sendError(context, "Please specify a loop mode", `**Usage:**\n> \`${client.settings.get(guildId, "prefix")}loop <song/queue/off>\``);
		}

		let loop = String(parameter).toLowerCase();
		if (!["song", "queue", "off"].includes(loop)) {
			return sendError(context, "Invalid loop mode", `**Please specify one of the following modes:**\n> \`song\`, \`queue\`, \`off\``);
		}

		switch (loop) {
		case "song":
			loop = 1;
			break;
		case "queue":
			loop = 2;
			break;
		case "off":
			loop = 0;
			break;
		}

		await newQueue.setRepeatMode(loop);
		return sendFollowUp(context, {
			content: `${client.allEmojis.check_mark} **Loop mode set to:** \`${loop === 1 ? "Song" : loop === 2 ? "Queue" : "Off"}\``
		});
	} catch (err) {
		console.log(`[ERROR] loop.js: ${err.stack}`.red);
		sendError(context, "Failed to set the loop mode", err.message);
	}
};