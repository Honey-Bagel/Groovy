const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const Setting = require('../../models/Settings');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');

module.exports = {
	name: "autoresume",
	usage: "autoresume [true/false]",
	aliases: ["aresume"],
	description: "Enable or disable auto-resume setting for the server",
	memberpermissions: ["MANAGE_GUILD"],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message, args) => {
		try {
			const { member } = message;
			const { guild } = member;

			const prevValue = await Setting.findOne({ _id: guild.id }).then((data) => data.autoresume);

			if(!args[0]) {
				await Setting.findOneAndUpdate({ _id: guild.id }, { autoresume: !prevValue }, { upsert: true });
				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor("Green")
							.setTitle(`${client.allEmojis.check_mark} Auto-resume is now ${!prevValue ? "enabled" : "disabled"}`)
					],
				}).then((msg) => {
					embedThen(guild.id, msg, message);
				});
			} else {
				if(args[0].toLowerCase() === "true" || args[0].toLowerCase() === "false") {
					const newValue = args[0].toLowerCase() === "true";
					if(newValue != prevValue) {
						await Setting.findOneAndUpdate({ _id: guild.id }, { autoresume: newValue }, { upsert: true });
						return message.channel.send({
							embeds: [
								new EmbedBuilder()
									.setColor("Green")
									.setTitle(`${client.allEmojis.check_mark} Auto-resume is now ${newValue ? "enabled" : "disabled"}`)
							],
						}).then((msg) => {
							embedThen(guild.id, msg, message);
						});
					}
				}
			}
		} catch (err) {
			console.log(`[ERROR] autoresume.js: ${err.stack}`.red);
			sendErrorMessage(message.channel, "Failed to update auto-resume setting", err.message);
		}
	}
};