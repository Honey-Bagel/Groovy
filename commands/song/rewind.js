const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const ee = require("../../configs/embed.json");
const { hasValidChannel, isUserInChannel, isQueueValid } = require("../../handlers/functions.js");
const { sendErrorMessage, embedThen } = require("../../handlers/functions.js");
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "rewind",
	usage: "rewind <TimeinSeconds>",
	aliases: ["rwd"],
	description: "Rewinds by specified number of seconds",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("rewind")
		.setDescription("Rewinds the current song by a specified number of seconds")
		.addIntegerOption(option =>
			option.setName('time')
				.setDescription('The number of seconds to rewind the song')
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
			sendError(context, "Please provide a time in seconds to rewind", `**Usage:**\n> \`${client.settings.get(guildId, "prefix")}rewind <TimeinSeconds>\``, client);
			return;
		}

		let seekNumber = Number(parameter);
		let seekTime = newQueue.currentTime - seekNumber;
		if (seekTime < 0) {
			seekTime = 0; // Prevent seeking before the start of the song
		}

		await newQueue.seek(seekTime);
		sendFollowUp(context, {
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setTitle("⏪ | Rewound the song")
				.setDescription(`>>> The song has been rewound by \`${seekNumber} seconds\` to \`${newQueue.formattedCurrentTime}\``)
			]
		});
	} catch (err) {
		console.log(`[ERROR] rewind.js: ${err.stack}`.red);
		sendError(context, "An error occurred while trying to rewind the song", err.message);
	}
}