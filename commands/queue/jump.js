const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");
const MusicHandler = require("../../handlers/musicHandler.js");
const musicHandler = MusicHandler.getInstance();

module.exports = {
	name: "jump",
	usage: "jump <number>",
	aliases: ["goto", "skipto",],
	description: "Jumps to a specific song in the queue",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("jump")
		.setDescription("Jumps to a specific song in the queue")
		.addIntegerOption(option =>
			option.setName('number')
				.setDescription('The position in the queue to jump to (0 is the first song)')
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

		const parameter = getQuery(context, 'number');

		await deferResponse(context);

		const ctx = createContextWrapper(context);

		const { member, guildId, guild, voiceChannel } = ctx;

		if (!hasValidChannel(context, guild, voiceChannel)) return;
		if (!isUserInChannel(context, voiceChannel)) return;
		if (!isQueueValid(context, client, guildId)) return;

		let newQueue = client.distube.getQueue(guildId);

		if(!parameter) {
			return sendError(context, "Please provide a position to jump to!", `**Usage:**\n> \`/jump <position>\``);
		}

		let position = Number(parameter);
		if(position > newQueue.songs.length - 1 || position < 0) {
			return sendError(context, "Invalid position!", `**Please provide a valid position between 1 and ${newQueue.songs.length - 1}.**`);
		}

		await newQueue.jump(position);

		let posEnd = "";
		switch(position) {
		case 1:
			posEnd = "st";
			break;
		case 2:
			posEnd = "nd";
			break;
		case 3:
			posEnd = "rd";
			break;
		default:
			posEnd = `th`;
		};

		const embed = new EmbedBuilder()
			.setColor("Green")
			.setTitle(`⏭️ | Jumped to the **${position}${posEnd}** song in the queue`);

		await musicHandler.updateQueueMessage(guildId, newQueue);

		return sendFollowUp(context, { embeds: [ embed ] });

	} catch (err) {
		console.log(`[ERROR] jump.js: ${err.stack}`.red);
		sendError(context, "Failed to jump to the specified song", err.message);
	}
}