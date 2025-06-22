const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const filters = require('../../configs/filters.json');
const Setting = require('../../models/Settings');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');

module.exports = {
	name: "defaultfilter",
	usage: "defaultfilter <filter1 filter2 ...>",
	aliases: ["dfilter"],
	description: "Defines the default filters for the server. Use 'none' to remove all default filters.",
	memberpermissions: ["MANAGE_GUILD"],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message, args) => {
		try {
			const { member } = message;
			const { guild } = member;

			if(args.some(a => !filters[a])) {
				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor(ee.wrongcolor)
							.setTitle(`${client.allEmojis.x} Invalid filter provided`)
							.setDescription("To define multiple filters, use spaces between them. To remove all filters, use 'none'.")
							.addFields(
								{ name: "Available Filters", value: Object.keys(filters).map(f => `\`${f}\``).join(", ") }
							)
					],
				}).then((msg) => {
					embedThen(guild.id, msg, message);
				});
			}

			await Setting.findOneAndUpdate({ _id: guild.id }, { defaultfilters: args }, { upsert: true });

			return message.channel.send({
				embeds: [
					new EmbedBuilder()
						.setColor("Green")
						.setTitle(`${client.allEmojis.check_mark} ${args.length > 0 ? "The new Default Filters are:" : "All Default Filters have been removed"}`)
						.setDescription(`${args.length > 0 ? args.map(f => `\`${f}\``).join(", ") : "None"}`)
				]
			}).then((msg) => {
				embedThen(guild.id, msg, message);
			});

		} catch (err) {
			console.log(`[ERROR] defaultfilter.js: ${err.stack}`.red);
			sendErrorMessage(message.channel, "Failed to update the default filters", err.message);
		}
	}
};