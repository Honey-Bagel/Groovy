const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const ee = require("../../configs/embed.json");
const { hasValidChannel, isChannelFull, isUserInChannel, getAudioStream, isYTLink } = require("../../handlers/functions.js");
const { embedThen, sendErrorMessage } = require("../../handlers/functions.js");
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "play",
	usage: "play <Search/Link>",
	aliases: ["p", "paly", "pley", "playsong", "song"],
	description: "Plays a song either from a link or a search term",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Plays a song either from a link or a search term")
		.addStringOption(option =>
			option.setName('song')
				.setDescription('The search term or link of the song you want to play')
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

		const parameter = getQuery(context, 'song');

		await deferResponse(context);

		const ctx = createContextWrapper(context);

		const { member, channelId, guildId, voiceChannel, guild } = ctx;

		if(!hasValidChannel(context, guild, voiceChannel)) return;
		if(!isChannelFull(context, voiceChannel)) return;
		if(!isUserInChannel(context, voiceChannel)) return;

		if(!parameter) {
			sendError(context, "Please provide a query", `**Usage:**\n> \`${client.settings.get(message.guild.id, "prefix")}play <Search/Link>\``, client);
			return;
		}

		const Text = parameter;
		try {
			const queue = client.distube.getQueue(guildId);
			let options = {
				member: member,
			};
			if(!queue) {
				options.textChannel = guild.channels.cache.get(channelId);
			}

			sendFollowUp(context, { content: `🔍 Searching for: \`${Text}\`...` });
			await client.distube.play(voiceChannel, Text, options);
		} catch(err) {
			console.log(`[ERROR] play.js ${err.stack}`.red);
			sendError(context, "An error occurred while trying to play the song", err.message);
		}
		return;
	} catch (error) {
		console.error(`[ERROR] play.js ${error.stack}`.red);
		return sendError(context, "Failed to play song", error.message);
	}
};