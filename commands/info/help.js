const { EmbedBuilder } = require("discord.js");
const ee = require('../../configs/embed.json');
const Setting = require('../../models/Settings');

module.exports = {
	name: "help",
	usage: "help [cmdname]",
	aliases: ["h", "halp", "helpme", "commands", "list"],
	description: "Returns all commands or a specific command",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message, args) => {
		try {
			const prefix = await Setting.findOne({ _id: message.guild.id }).then((data) => data.prefix);
			if(args[0] && args[0].length > 0) {
				const embed = new EmbedBuilder();
				const cmd = client.commands.get(args[0].toLowerCase()) || client.commands.get(client.aliases.get(args[0].toLowerCase()));
				if(!cmd) {
					return message.channel.send({
						embeds: [embed
							.setColor(ee.wrongcolor)
							.setDescription(`No information found for command **${args.toLowerCase()}**`)
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
				return message.channel.send({
					embeds: [embed.setColor(ee.color)]
				});
			} else {
				const embed = new EmbedBuilder()
					.setColor(ee.color)
					.setTitle("HELP MENU ❓ Commands")
					.setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
					.setDescription(`**To see Command Description & Information, type: ${prefix}help [CMD NAME]** \n\n [Invite me with __Slash Commands__ Permissions](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands), cause all of my Commands are available as Slash Commands too!\n\n> Check out the [**Dashboard**](/dashboard/${message.guild.id}) or the [**Live Music Queue**](/queue/${message.guild.id})`);
				const commands = (category) => {
					return client.commands.filter((cmd) => cmd.category === category).map((cmd) => `\`${cmd.name}\``);
				};
				try {
					for (let i = 0; i < client.categories.length; i += 1) {
						const current = client.categories[i];
						const items = commands(current);
						if(items.length === 0) continue;
						embed.addFields([ { name: `**${current.toUpperCase()} [${items.length}]**`, value:  `> ${items.join(", ")}` }]);
					}
				} catch (e) {
					console.log(String(e.stack).red);
				}
				message.channel.send({
					embeds: [embed]
				});
			}
		} catch (err) {
			console.error(`[ERROR] Failed at Help Command: ${err.message}`.red);
		}
	}
};