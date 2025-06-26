const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const ee = require('../../configs/embed.json');
const Setting = require('../../models/Settings');
const { sendFollowUp, sendError, deferResponse, getQuery, isSlashCommand, createContextWrapper } = require("../../utils/commandUtils.js");

module.exports = {
	name: "help",
	usage: "help [cmdname]",
	aliases: ["h", "halp", "helpme", "commands", "list"],
	description: "Returns all commands or a specific command",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Returns all commands or a specific command")
		.addStringOption(option =>
			option.setName('commandname')
				.setDescription('The name of the command you want help with')
				.setRequired(false)
		),

	execute: async (client, message, args) => {
		return executeCommand(client, { message, args });
	},

	executeSlash: async (client, interaction) => {
		return executeCommand(client, { interaction });
	},
};

async function executeCommand(client, context) {
	try {
		const isSlash = isSlashCommand(context);

		const parameter = getQuery(context, "commandname");

		await deferResponse(context);

		const ctx = createContextWrapper(context);

		const { member, channelId, guildId, voiceChannel } = ctx;

		const prefix = await Setting.findOne({ _id: guildId }).then((data) => data.prefix);

		if(parameter && parameter.length > 0) {
			const embed = new EmbedBuilder();
			const cmd = client.commands.get(parameter.toLowerCase()) || client.commands.get(client.aliases.get(parameter.toLowerCase()));
			if(!cmd) {
				return sendFollowUp(context, {
					embeds: [ embed
						.setColor(ee.wrongcolor)
						.setDescription(`No information found for command **${parameter.toLowerCase()}**`)
					]
				});
			}
			if (cmd.name) embed.addFields([ { name: "**Command name**", value: `\`${cmd.name}\`` }]);
			if (cmd.name) embed.setTitle(`Detailed Information about:\`${cmd.name}\``);
			if (cmd.description) embed.addFields([ { name: "**Description**", value: `\`${cmd.description}\`` }]);
			if (cmd.aliases) embed.addFields([ { name: "**Aliases**", value: `\`${cmd.aliases.map((a) => `${a}`).join("`, `")}\`` }]);
			if (cmd.usage) {
				embed.addFields([ { name: "**Usage**", value: `\`${prefix}${cmd.usage}\`` }]);
				embed.setFooter({ text: "Syntax: <> = required, [] = optional" });
			}
			return sendFollowUp(context, {
				embeds: [ embed.setColor(ee.color) ]
			});
		} else {
			const embed = new EmbedBuilder()
				.setColor(ee.color)
				.setTitle("HELP MENU ❓ Commands")
				.setDescription(`**To see Command Description & Information, type: ${prefix}help [CMD NAME]** \n\n [Invite me with __Slash Commands__ Permissions](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands), cause all of my Commands are available as Slash Commands too!\n\n> Check out the [**Dashboard**](/dashboard/${guildId}) or the [**Live Music Queue**](/queue/${guildId})`);
			const commands = (category) => {
				return client.commands.filter((cmd) => cmd.category === category).map((cmd) => `\`${cmd.name}\``);
			};
			try {
				for (let i = 0; i < client.categories.length; i += 1) {
					const current = client.categories[i];
					const items = commands(current);
					if(items.length === 0) continue;
					embed.addFields([ { name: `**${current.toUpperCase()} [${items.length}]**`, value: `> ${items.join(", ")}` }]);
				}
			} catch (e) {
				console.log(String(e.stack).red);
			}

			return sendFollowUp(context, {
				embeds: [embed]
			});
		}
	} catch (err) {
		console.error(`[ERROR] help.js: ${err.stack}`.red);
		sendError(context, "Failed to execute help command", err.message);
		return;
	}
}