const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { sendErrorMessage } = require('../../handlers/functions');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "invite",
	usage: "invite",
	aliases: ["inv", "addme"],
	description: "Get the invite link for the bot",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Get the invite link for the bot"),

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

		const { user } = ctx;

		await user.send({
			embeds: [new EmbedBuilder()
				.setColor(ee.color)
				.setTitle(`Invite ${client.user.username} to your server!`)
				.setDescription(`[Click here to invite me!](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands)`)
			]
		});

		await sendFollowUp(context, { content: "Sent you a dm" }, 1);
		return;
	} catch (err) {
		console.log(`[ERROR] invite.js: ${err.stack}`.red);
		sendError(context, "Failed to send invite link", err.message);
	}
}