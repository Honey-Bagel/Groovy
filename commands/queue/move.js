const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "move",
	usage: "move <from> <to>",
	aliases: ["swap", "switch"],
	description: "Moves a song from one position to another in the queue",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("move")
		.setDescription("Moves a song from one position to another in the queue")
		.addIntegerOption(option =>
			option.setName('from')
				.setDescription('The position of the song to move from')
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option.setName('to')
				.setDescription('The position to move the song to')
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
		await deferResponse(context);

		const ctx = createContextWrapper(context);
		const { member, channelId, guildId, voiceChannel, guild } = ctx;

		if (!hasValidChannel(context, guild, voiceChannel)) return;
		if (!isUserInChannel(context, voiceChannel)) return;
		if (!isQueueValid(context, client, guildId)) return;

		let newQueue = client.distube.getQueue(guildId);
		let from = parseInt(getQuery(context, 'from'));
		let to = parseInt(getQuery(context, 'to'));

		if (isNaN(from) || isNaN(to) || from < 1 || to < 1 || from > newQueue.songs.length || to > newQueue.songs.length || from === to) {
			return sendError(context, "Invalid positions", `**Usage:**\n> \`${client.settings.get(guildId, "prefix")}move <from> <to>\`\n**Valid range:** 1 - ${newQueue.songs.length}`);
		}

		let song = newQueue.songs[from];
		newQueue.songs[from] = newQueue.songs[to];
		newQueue.songs[to] = song;

		return sendFollowUp(context, {
			content: `🔄 | Moved song from position ${from} to ${to}`,
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setDescription(`**Moved:** \`${song.name}\` by \`${song.uploader.name}\``)
			]
		});
	} catch (err) {
		console.error(`[ERROR] move.js: ${err.stack}`.red);
		return sendError(context, "Failed to move song", err.message);
	}
}