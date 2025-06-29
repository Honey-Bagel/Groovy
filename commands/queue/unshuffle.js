const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");
const MusicHandler = require("../../handlers/musicHandler.js");
const musicHandler = MusicHandler.getInstance();

module.exports = {
	name: "unshuffle",
	usage: "unshuffle",
	aliases: ["unmix"],
	description: "Unshuffles the queue",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("unshuffle")
		.setDescription("Unshuffles the queue"),

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
		const { member, channelId, guildId, voiceChannel, guild } = ctx;

		if (!hasValidChannel(guild, context, voiceChannel)) return;
		if (!isUserInChannel(context, voiceChannel)) return;
		if (!isQueueValid(context, client, guildId)) return;

		let newQueue = client.distube.getQueue(guildId);

		if (!client.maps.has(`beforeshuffle-${newQueue.id}`)) {
			return sendError(context, "No previous shuffle state found", "Please shuffle the queue first before trying to unshuffle it.");
		}

		const unshuffled = client.maps.get(`beforeshuffle-${newQueue.id}`);
		const currentSongs = new Map();
		newQueue.songs.forEach(song => {
			currentSongs.set(song.url || song.id, song);
		});

		const unshuffledQueue = [];

		for (const originalSong of unshuffled) {
			const songKey = originalSong.url || originalSong.id;
			if (currentSongs.has(songKey)) {
				unshuffledQueue.push(originalSong);
				currentSongs.delete(songKey);
			}
		}

		for (const song of newQueue.songs) {
			const songKey = song.url || song.id;
			if (currentSongs.has(songKey)) {
				unshuffledQueue.push(song);
			}
		}

		newQueue.songs = [newQueue.songs[0], ...unshuffledQueue];

		await musicHandler.updateQueueMessage(guildId, newQueue);

		return await sendFollowUp(context, {
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setTitle(`🔄 | Unshuffled the queue, now has ${newQueue.songs.length} songs`)
			]
		});
	} catch (err) {
		console.error(`[ERROR] unshuffle.js: ${err.stack}`.red);
		return sendError(context, "An error occurred while unshuffling the queue", err.message);
	}
};