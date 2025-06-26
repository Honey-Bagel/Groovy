const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendResponse, sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "addrelated",
	usage: "addrelated",
	aliases: [],
	description: "Add a similar song to the current song",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("addrelated")
		.setDescription("Add a similar song to the current song"),

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

		let newEmbed = await sendResponse(context, {
			embeds: [ new EmbedBuilder()
				.setTitle(`🔍 Searching Related Song for... **${newQueue.songs[0].name}**`)
			]
		});

		await newQueue.addRelatedSong();
		await sendFollowUp(context, {
			embeds: [ new EmbedBuilder()
				.setColor("Green")
				.setTitle(`👍 Added: ** ${ newQueue.songs[newQueue.songs.length - 1].name }`)
			]
		});

	} catch (err) {
		console.log(`[ERROR] addrelated.js: ${err.stack}`.red);
		sendError(context, "Failed to add related song", err.message);
	}
}