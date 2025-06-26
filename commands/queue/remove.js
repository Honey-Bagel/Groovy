const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "remove",
	usage: "remove <position> | remove <position> <count>",
	aliases: ["delete", "del", "rm"],
	description: "Removes a song or multiple songs from the queue by their position(s)",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("remove")
		.setDescription("Removes a song or multiple songs from the queue by their position(s)")
		.addIntegerOption(option =>
			option.setName('position')
				.setDescription('The position of the song to remove')
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option.setName('count')
				.setDescription('The number of songs to remove starting from the position')
				.setRequired(false)
		),

	execute: async (client, message, args) => {
		return executeCommnad(client, { message, args });
	},

	executeSlash: async (client, interaction) => {
		return executeCommnad(client, { interaction });
	}
};

async function executeCommnad(client, context) {
	try {
		const isSlash = isSlashCommand(context);

		const position = getQuery(context, 'position');
		const count = getQuery(context, 'count');

		await deferResponse(context);

		const ctx = createContextWrapper(context);

		const { member, channelId, guildId, voiceChannel, guild } = ctx;

		if (!hasValidChannel(guild, context, voiceChannel)) return;
		if (!isUserInChannel(context, voiceChannel)) return;
		if (!isQueueValid(context, client, guildId)) return;

		let newQueue = client.distube.getQueue(guildId);

		if (!position) {
			return sendError(context, "Please provide a position to remove the song(s)", `**Usage:**\n> \`${client.settings.get(guildId, "prefix")}remove <position> | remove <position> <count> | remove <pos1> <pos2> <pos3>...\``);
		}

		if(position < 1 || position > newQueue.songs.length) {
			return sendError(context, "Invalid position provided", `**Valid range:** 1 - ${newQueue.songs.length}`);
		}

		let songIndex = Number(position);
		let amount = Number(count ? count : 1);

		if(amount === 0) {
			amount = 1;
		}

		newQueue.songs.splice(position, amount);

		return sendFollowUp(context, {
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setTitle(`🗑 Removed ${amount} Song${amount > 1 ? "s" : ""} from the Queue`)
			]
		});

	} catch (err) {
		console.error(`[ERROR] remove.js: ${err.stack}`.red);
		return sendError(context, "Failed to remove song(s)", err.message);
	}
};