const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const Setting = require('../../models/Settings');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');

module.exports = {
	name: "prefix",
	usage: "prefix <new prefix>",
	aliases: ["setprefix", "serverprefix"],
	description: "Sets the prefix for the server",
	memberpermissions: ["MANAGE_GUILD"],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message, args) => {
		try {
			const { member } = message;
			const { guild } = member;

			if(!args[0]) {
				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor(ee.wrongcolor)
							.setTitle("Please provide a new prefix for your server")
					],
				});
			}

			let newPrefix = args[0];
			if(newPrefix.length > 1) {
				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor(ee.wrongcolor)
							.setTitle("The prefix must be a single character")
					],
				});
			}

			await Setting.findOneAndUpdate({ _id: guild.id }, { prefix: newPrefix }, { upsert: true });
			return message.channel.send({
				embeds: [
					new EmbedBuilder()
						.setColor("Green")
						.setTitle(`${client.allEmojis.check_mark} Prefix is now set to \`${newPrefix}\``)
				]
			});
		} catch (err) {
			console.log(`[ERROR] prefix.js: ${err.stack}`.red);
			sendErrorMessage(message.channel, "Failed to update this server's prefix", err.message);
		}
	}
};