const { Events } = require('discord.js');
const Discord = require('discord.js');
const config = require("../../configs/config.json");

module.exports = {
	name: Events.MessageCreate,
	execute: async (message) => {
		const client = message.client;
		if(message.author.bot) return;
		if(message.guild !== null) return;
		if(message.channel.partial) await message.channel.fetch();
		if(message.partial) await message.fetch();

		const channel = client.channels.cache.find(c => c.id === "937589915779215400");
		channel.send({
			embeds: [
				new Discord.EmbedBuilder()
					.setTitle("New DM")
					.setColor("#F8AA2A")
					.setDescription(`**User:** ${message.author.tag}\n **User ID:** ${message.author.id}\n **At:** ${new Date()}\n\n **Content:** \`\`\`${message.content}\`\`\``)
			]
		});

		const prefix = config.prefix;
		const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})`);

		if(!prefixRegex.test(message.content)) return;
		cont [_, mPrefix] = message.content.match(prefixRegex);
		const args = message.content.slice(mPrefix.length).trim().split(/ +/).filter(Boolean);
		const cmd = args.length > 0 ? args.shift().toLowerCase() : null;
		if (!cmd || cmd.length == 0) {
			if (mPrefix.includes(client.user.id)) {
				message.reply({
					embeds: [new Discord.MessageEmbed().setColor(ee.color).setFooter(ee.footertext, ee.footericon).setTitle(`:thumbsup: **My Prefix here, is \`${prefix}\`**`)]
				});
			}
			return;
		}
		let command = client.dmCommands.get(cmd);
		if (!command) command = client.commands.get(client.aliases.get(cmd));
		if (command) {

			if(message.content.indexOf(" ") == 1) {
				return;
			}
			try {
			//if Command has specific permission return error
				if (command.memberpermissions && command.memberpermissions.length > 0 && !message.member.permissions.has(command.memberpermissions)) {
					return message.reply({
						embeds: [new Discord.MessageEmbed()
							.setColor(ee.wrongcolor)
							.setFooter(ee.footertext, ee.footericon)
							.setTitle(replacemsg(settings.messages.notallowed_to_exec_cmd.title))
							.setDescription(replacemsg(settings.messages.notallowed_to_exec_cmd.description.memberpermissions, {
								command: command,
								prefix: prefix
							}))
						]
					}).then(msg => {
						setTimeout(() => {
							msg.delete().catch((e) => {
								console.log(String(e).grey);
							});
						}, settings.timeout.notallowed_to_exec_cmd.memberpermissions);
					}).catch((e) => {
						console.log(String(e).grey);
					});
				}
				//if Command has specific needed roles return error
				if (command.requiredroles && command.requiredroles.length > 0 && message.member.roles.cache.size > 0 && !message.member.roles.cache.some(r => command.requiredroles.includes(r.id))) {
					return message.reply({
						embeds: [new Discord.MessageEmbed()
							.setColor(ee.wrongcolor)
							.setFooter(ee.footertext, ee.footericon)
							.setTitle(replacemsg(settings.messages.notallowed_to_exec_cmd.title))
							.setDescription(replacemsg(settings.messages.notallowed_to_exec_cmd.description.requiredroles, {
								command: command,
								prefix: prefix
							}))
						]
					}).then(msg => {
						setTimeout(() => {
							msg.delete().catch((e) => {
								console.log(String(e).grey);
							});
						}, settings.timeout.notallowed_to_exec_cmd.requiredroles);
					}).catch((e) => {
						console.log(String(e).grey);
					});

				}
				//if Command has specific users return error
				if (command.alloweduserids && command.alloweduserids.length > 0 && !command.alloweduserids.includes(message.author.id)) {
					return message.reply({
						embeds: [new Discord.MessageEmbed()
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
				//if command has minimum args, and user dont entered enough, return error
				if (command.minargs && command.minargs > 0 && args.length < command.minargs) {
					return message.reply({
						embeds: [new Discord.MessageEmbed()
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
				//if command has maximum args, and user enters too many, return error
				if (command.maxargs && command.maxargs > 0 && args.length > command.maxargs) {
					return message.reply({
						embeds: [new Discord.MessageEmbed()
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

				//if command has minimum args (splitted with `++`), and user dont entered enough, return error
				if (command.minplusargs && command.minplusargs > 0 && args.join(` `).split(`++`).filter(Boolean).length < command.minplusargs) {
					return message.reply({
						embeds: [new Discord.MessageEmbed()
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
						}, settings.timeout.minplusargs);
					}).catch((e) => {
						console.log(String(e).grey);
					});
				}
				//if command has maximum args (splitted with `++`), and user enters too many, return error
				if (command.maxplusargs && command.maxplusargs > 0 && args.join(` `).split(`++`).filter(Boolean).length > command.maxplusargs) {
					return message.reply({
						embeds: [new Discord.MessageEmbed()
							.setColor(ee.wrongcolor)
							.setFooter(ee.footertext, ee.footericon)
							.setTitle(`${client.allEmojis.x} Wrong Command Usage!`)
							.setDescription(command.argstoomany_message && command.argstoomany_message.trim().length > 0 ? command.argsmissing_message : command.usage ? `Usage: ` + command.usage : `Wrong Command Usage`)
						]
					}).then(msg => {
						setTimeout(() => {
							msg.delete().catch((e) => {
								console.log(String(e).grey);
							});
						}, settings.timeout.maxplusargs);
					}).catch((e) => {
						console.log(String(e).grey);
					});
				}

				//run the command with the parameters:  client, message, args, Cmduser, text, prefix,
				command.run(client, message, args, args.join(` `).split(`++`).filter(Boolean), message.member, args.join(` `), prefix);
			} catch (error) {
				if (settings.somethingwentwrong_cmd) {
					return message.reply({
						embeds: [new Discord.MessageEmbed()
							.setColor(ee.wrongcolor)
							.setFooter(ee.footertext, ee.footericon)
							.setTitle(replacemsg(settings.messages.somethingwentwrong_cmd.title, {
								prefix: prefix,
								command: command
							}))
							.setDescription(replacemsg(settings.messages.somethingwentwrong_cmd.description, {
								error: error,
								prefix: prefix,
								command: command
							}))
						]
					}).then(msg => {
						setTimeout(() => {
							msg.delete().catch((e) => {
								console.log(String(e).grey);
							});
						}, 4000);
					}).catch((e) => {
						console.log(String(e).grey);
					});
				}
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
};