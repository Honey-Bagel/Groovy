const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const { sendResponse, sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "search",
	usage: "search <query>",
	aliases: ["find", "srch", "lookup", "findsong"],
	description: "Search for a song",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("search")
		.setDescription("Search for a song")
		.addStringOption(option =>
			option.setName('query')
				.setDescription('The search term for the song you want to find')
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

		const parameter = getQuery(context, 'query');

		await deferResponse(context);

		const ctx = createContextWrapper(context);

		const { member, guild, voiceChannel } = ctx;

		// if(!hasValidChannel(context, guild, voiceChannel)) return;
		// if(!isUserInChannel(context, voiceChannel)) return;

		if(!parameter) {
			sendError(context, "Please provide a query", `**Usage:**\n> \`${client.settings.get(guild.id, "prefix")}search <Search Term>\``, client);
			return;
		}

		if(ctx.channel.activeCollector) {
			sendError(context, "Please wait for the current search to finish", "", client);
			return;
		}

		const resultsEmbed = new EmbedBuilder()
			.setTitle(`**Reply with the song number you want to play** (type cancel to stop search)`)
			.setDescription(`Results for: ${parameter}`)
			.setColor("#F8AA2A");

		let resultsArray = [];

		const results = await client.distube.search(parameter, { type: "video", limit: 10, safeSearch: false });

		results.map((video, index) => {
			resultsEmbed.addFields([
				{ name: `${video.shortURL}`, value: `${index + 1}. ${video.title} ${video.duration}` }
			]);
		});

		let resultsMessage = await sendResponse(context, { embeds: [ resultsEmbed ] });

		function filter(msg) {
			const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/;
			return pattern.test(msg.content);
		}

		ctx.channel.activeCollector = true;
		const collector = await ctx.channel.createMessageCollector({
			filter, max: 1, time: 10000, errors: ["time"]
		});

		collector.on("collect", async i => {
			if(i.content === "cancel") {
				collector.stop();
			} else if(i.content.includes(",")) {
				let songs = i.content.split(",").map((str) => str.trim());

				for(let song of songs) {
					await client.commands.get("play").execute(context, [ resultsEmbed.fields[parseInt(song) - 1].name]);
				}
			} else {
				const choice = resultsEmbed.datga.fields[parseInt(i.content) - 1].name;
				client.distube.play(voiceChannel, choice, {
					member: ctx.member,
					textChannel: ctx.channel
				});
			}

			ctx.channel.activeCollector = false;
			resultsMessage.delete().catch(console.error);
			i.delete().catch(console.error);
			collector.stop();
		});

	} catch (err) {
		console.log(`[ERROR] search.js: ${err.stack}`.red);
		sendError(context, "Failed to search for a song", err.message);
	}
}