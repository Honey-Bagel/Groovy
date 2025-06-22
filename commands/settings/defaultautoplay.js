const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const Setting = require('../../models/Settings');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');

module.exports = {
	name: "autoplay",
	usage: "autoplay [true/false]",
	aliases: ["dautoplay"],
	description: "Enable or disable the default autoplay setting for the server",
	memberpermissions: ["MANAGE_GUILD"],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message, args) => {
		try {
			const { member } = message;
			const { guild } = member;

			const prevValue = await Setting.findOne({ _id: guild.id }).then((data) => data.defaultautoplay);

			if(!args[0]) {
				await Setting.findOneAndUpdate({ _id: guild.id }, { defaultautoplay: !prevValue }, { upsert: true });
				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor("Green")
							.setTitle(`${client.allEmojis.check_mark} Default Autoplay is now ${!prevValue ? "enabled" : "disabled"}`)
					],
				}).then((msg) => {
					embedThen(guild.id, msg, message);
				});
			} else {
				if(args[0].toLowerCase() === "true" || args[0].toLowerCase() === "false") {
					const newValue = args[0].toLowerCase() === "true";
					if(newValue != prevValue) {
						await Setting.findOneAndUpdate({ _id: guild.id }, { defaultautoplay: newValue }, { upsert: true });
						return message.channel.send({
							embeds: [
								new EmbedBuilder()
									.setColor("Green")
									.setTitle(`${client.allEmojis.check_mark} Default Autoplay is now ${newValue ? "enabled" : "disabled"}`)
							],
						}).then((msg) => {
							embedThen(guild.id, msg, message);
						});
					}
				}
			}
		} catch (err) {
			console.log(`[ERROR] defaultautoplay.js: ${err.stack}`.red);
			sendErrorMessage(message.channel, "Failed to update autoplay setting", err.message);
		}
	}
};