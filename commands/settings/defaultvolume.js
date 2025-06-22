const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const Setting = require('../../models/Settings');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');

module.exports = {
	name: "defaultvolume",
	usage: "defaultvolume <amount>",
	aliases: ["dvolume", "servervolume"],
	description: "Sets the default volume for the server",
	memberpermissions: ["MANAGE_GUILD"],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message, args) => {
		try {
			const { member } = message;
			const { guild } = member;

			if(!args[0]) {
				sendErrorMessage(message.channel, "Please provide a valid volume amount for your server");
				return;
			} else {
				let Volume = Number(args[0]);
				if(!Volume || (Volume > 200 || Volume < 1)) {
					sendErrorMessage(message.channel, "Please provide a valid volume amount for your server");
					return;
				}

				await Setting.findOneAndUpdate({ _id: guild.id }, { defaultVolume: Volume }, { upsert: true });
				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor("Green")
							.setTitle(`${client.allEmojis.check_mark} Default volume is now set to ${Volume}`)
					],
				}).then((msg) => {
					embedThen(guild.id, msg, message);
				});
			}
		} catch (err) {
			console.log(`[ERROR] defaultvolume.js: ${err.stack}`.red);
			sendErrorMessage(message.channel, "Failed to update this server's default volume", err.message);
		}
	}
};