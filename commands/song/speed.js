const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const FilterSettings = require("../../configs/filters.json");
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "speed",
	usage: "speed <SpeedAmount>",
	aliases: ["customspeed", "changespeed", "cspeed"],
	description: "Changes the playback speed of the current song",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("speed")
		.setDescription("Changes the playback speed of the current song")
		.addStringOption(option =>
			option.setName('speed')
				.setDescription('The speed amount to set (e.g., "1.5", "2", "off")')
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
		const parameter = getQuery(context, 'speed');

		await deferResponse(context);

		const ctx = createContextWrapper(context);
		const { member, channelId, guildId, voiceChannel, guild } = ctx;

		if (!hasValidChannel(context, guild, voiceChannel)) return;
		if (!isUserInChannel(context, voiceChannel)) return;
		if (!isQueueValid(context, client, guildId)) return;

		let newQueue = client.distube.getQueue(guildId);

		if (!parameter) {
			return sendError(context, "Please provide a speed amount", `**Usage:**\n> \`${client.settings.get(guildId, "prefix")}speed <SpeedAmount>\``, client);
		}

		let speedAmount = parameter;

		FilterSettings.speed = `atempo=${speedAmount}`;
		client.distube.filters = FilterSettings;

		if (speedAmount === 'off' && newQueue.filters?.length) {
			newQueue.setFilter(false);
			return sendFollowUp(context, {
				embeds: [new EmbedBuilder()
					.setColor("Green")
					.setTitle("⏹ | Speed filter has been turned off")
				]
			});
		}

		if (newQueue.filters.has("speed")) {
			await newQueue.filters.add(["speed"]);
		}

		await newQueue.filters.add(["speed"]);

		sendFollowUp(context, {
			embeds: [new EmbedBuilder()
				.setColor("Green")
				.setTitle(`⏩ | Set the speed to \`${speedAmount}\``)
				.setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
			]
		});
	} catch (err) {
		console.error(`[ERROR] speed.js: ${err.stack}`.red);
		sendError(context, "An error occurred while trying to change the playback speed", err.message);
	}
}