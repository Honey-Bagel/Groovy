const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "seek",
	usage: "seek <TimeinSeconds>",
	aliases: ["sek", "goto"],
	description: "Seeks to a specified time in the current song",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("seek")
		.setDescription("Seeks to a specified time in the current song")
		.addIntegerOption(option =>
			option.setName('time')
				.setDescription('The number of seconds to seek to')
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
			sendError(context, "Please provide a time in seconds to seek to", `**Usage:**\n> \`${client.settings.get(guildId, "prefix")}seek <TimeinSeconds>\``, client);
			return;
		}

		let seekNumber = Number(parameter);
		if (seekNumber > newQueue.songs[0].duration || seekNumber < 0) {
			sendError(context, "Invalid seek time", `Please provide a valid time in seconds between \`0\` and \`${newQueue.songs[0].duration}\``);
			return;
		}

		await newQueue.seek(seekNumber);
		sendFollowUp(context, {
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setTitle(`⏩ Seeked to \`${seekNumber} seconds\``)
				.setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
			]
		});
	} catch (err) {
		console.error(`[ERROR] seek.js: ${err.stack}`.red);
		sendError(context, "An error occurred while trying to seek in the song", err.message);
	}
}