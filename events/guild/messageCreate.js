const { Events } = require('discord.js');
const Discord = require('discord.js');
const ee = require('../../configs/embed.json');
const settings = require('../../configs/settings.json');
const Setting = require('../../models/Settings');
const { replacemsg, fieldCreate } = require('../../handlers/functions');

module.exports = {
	name: Events.MessageCreate,
	execute: async (message) => {
		const client = message.client;
		if(!message.guild || !message.channel || message.author.bot) return; // Check for a valid message
		if(message.channel.partial) await message.channel.fetch(); // Fetch the channel if it's a partial
		if(message.partial) await message.fetch(); // Fetch the message if it's a partial

		const prefix = await Setting.findOne({ _id: message.guild.id }).then((data) => {
			return data.prefix;
		});

		const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})`);
		if(!prefixRegex.test(message.content)) return;
		const [, mPrefix] = message.content.match(prefixRegex);
		const args = message.content.slice(mPrefix.length).trim().split(/ +/).filter(Boolean);
		const cmd = args.length > 0 ? args.shift().toLowerCase() : null;
		if(!cmd || cmd.length == 0) {
			if(mPrefix.includes(client.user.id)) {
				message.reply({
					embeds: [new Discord.EmbedBuilder().setColor('Random').setTitle(`**My prefix is \`${prefix}\`**`)]
				});
			}
			return;
		}

		let command = client.commands.get(cmd);
		if(!command) command = client.commands.get(client.aliases.get(cmd));

		if(message.content.indexOf(" ") == 1) {
			return;
		}

		try {
			// Check if the command has specific permissions
			if(command.memberpermissions && command.memberpermissions.length > 0 && !message.member.permissions.has(command.memberpermissions)) {
				return message.reply({
					embeds: [new Discord.EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setFooter(ee.footertext, ee.footericon)
						.setTitle(replacemsg(settings.messages.notallowed_to_exec_cmd.title))
						.setDescription(replacemsg(settings.messages.notallowed_to_exec_cmd.description.memberpermissions, {
							command: command,
							prefix: prefix,
						}))
					]
				}).then(msg => {
					setTimeout(() => {
						msg.delete().catch((e) => {
							console.log(String(e).red);
						});
					}, settings.timeout.notallowed_to_exec_cmd.memberpermissions);
				}).catch((e) => {
					console.log(String(e).red);
				});
			}

			// Check if the command has specific roles
			if(command.requiredroles && command.requiredroles.length > 0 && message.member.roles.cache.size > 0 && !message.member.roles.cache.some(r => command.requiredroles.includes(r.id))) {
				return message.reply({
					embeds: [new Discord.EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setFooter(ee.footertext, ee.footericon)
						.setTitle(replacemsg(settings.messages.notallowed_to_exec_cmd.title))
						.setDescription(replacemsg(settings.messages.notallowed_to_exec_cmd.description.requiredroles, {
							command: command,
							prefix: prefix,
						}))
					]
				}).then(msg => {
					setTimeout(() => {
						msg.delete().catch((e) => {
							console.log(String(e).red);
						});
					}, settings.timeout.notallowed_to_exec_cmd.requiredroles);
				}).catch((e) => {
					console.log(String(e).red);
				});
			}

			// Check if the command is for specific users
			if(command.alloweduserids && command.alloweduserids.length > 0 && !command.alloweduserids.includes(message.author.id)) {
				return message.reply({
					embeds: [new Discord.EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setFooter(ee.footertext, ee.footericon)
						.setTitle(replacemsg(settings.messages.notallowed_to_exec_cmd.title))
						.setDescription(replacemsg(settings.messages.notallowed_to_exec_cmd.description.alloweduserids, {
							command: command,
							prefix: prefix
						}))
					]
				}).then(msg => {
					setTimeout(() => {
						msg.delete().catch((e) => {
							console.log(String(e).grey);
						});
					}, settings.timeout.notallowed_to_exec_cmd.alloweduserids);
				}).catch((e) => {
					console.log(String(e).grey);
				});
			}

			// Check if the command has the min # of args
			if (command.minargs && command.minargs > 0 && args.length < command.minargs) {
				return message.reply({
					embeds: [new Discord.EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setFooter(ee.footertext, ee.footericon)
						.setTitle(`${client.allEmojis.x} Wrong Command Usage!`)
						.setDescription(command.argsmissing_message && command.argsmissing_message.trim().length > 0 ? command.argsmissing_message : command.usage ? `Usage: ` + command.usage : `Wrong Command Usage`)
					]
				}).then(msg => {
					setTimeout(() => {
						msg.delete().catch((e) => {
							console.log(String(e).grey);
						});
					}, settings.timeout.minargs);
				}).catch((e) => {
					console.log(String(e).grey);
				});
			}

			// Check if the command has the max # of args
			if (command.maxargs && command.maxargs > 0 && args.length > command.maxargs) {
				return message.reply({
					embeds: [new Discord.EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setFooter(ee.footertext, ee.footericon)
						.setTitle(`${client.allEmojis.x} Wrong Command Usage!`)
						.setDescription(command.argstoomany_message && command.argstoomany_message.trim().length > 0 ? command.argstoomany_message : command.usage ? `Usage: ` + command.usage : `Wrong Command Usage`)
					]
				}).then(msg => {
					setTimeout(() => {
						msg.delete().catch((e) => {
							console.log(String(e).grey);
						});
					}, settings.timeout.maxargs);
				}).catch((e) => {
					console.log(String(e).grey);
				});
			}

			// Check if the command is ready/stable for global use
			if(command.stable != null && !command.stable && !command.alloweduserids.includes(message.author.id)) {
				console.log(`${message.author.tag} tried to use a command (${command.name}) that is not stable yet!`.yellow);
				return;
			}

			// Log the command usage
			const channel = client.channels.cache.find(c => c.id === "933618477967769620");
			channel.send({
				embeds: [new Discord.EmbedBuilder()
					.setTitle(`Command Executed \`Basic Command\``)
					.setColor("#F8AA2A")
					.setDescription(`**User:** ${message.author.tag}\n**User ID:** ${message.author.id}\n**Guild:** ${message.guild} | ${message.guild.id}\n**At** ${new Date()}\n\n**Content:** \`\`\`${message.content}\`\`\``)
				]
			});

			// Try to execute the command
			command.execute(client, message, args, args.join(` `).split(`++`).filter(Boolean), message.member, args.join(` `), prefix);
		} catch(error) {
			if(settings.somethingwentwrong_cmd) {
				return message.reply({
					embeds: [new Discord.EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setFooter(ee.footertext, ee.footericon)
						.setTitle(replacemsg(settings.messages.somethingwentwrong_cmd.title), {
							command: command,
							prefix: prefix
						})
						.setDescription(replacemsg(settings.messages.somethingwentwrong_cmd.description, {
							error: error,
							command: command,
							prefix: prefix
						}))
					]
				}).then(msg => {
					setTimeout(() => {
						msg.delete().catch((e) => {
							console.log(String(e).red);
						});
					}, 4000);
				}).catch((e) => {
					console.log(String(e).red);
				});
			}
		}
	}
};

function escapeRegex(str) {
	try {
		return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
	} catch {
		return str;
	}
}