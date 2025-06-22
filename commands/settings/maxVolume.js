const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const Setting = require('../../models/Settings');
const { sendErrorMessage, embedThen } = require('../../handlers/functions');

module.exports = {
	name: "maxVolume",
	usage: "maxVolume <amount>",
	aliases: ["mVolume", "servermaxvolume"],
	description: "Sets the default max volume for the server",
	memberpermissions: ["MANAGE_GUILD"],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message, args) => {
		try {
			const { member } = message;
			const { guild } = member;

			if(!args[0]) {
				sendErrorMessage(message.channel, "Please provide a valid volume amount between 0 and 1000.");
				return;
			} else {
				let Volume = Number(args[0]);
				if(!Volume || (Volume > 1000 || Volume < 1)) {
					sendErrorMessage(message.channel, "Please provide a valid volume amount between 0 and 1000.");
					return;
				}

				await Setting.findOneAndUpdate({ _id: guild.id }, { maxVolume: Volume }, { upsert: true });
				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor("Green")
							.setTitle(`${client.allEmojis.check_mark} Default max volume is now set to ${Volume}`)
					],
				}).then((msg) => {
					embedThen(guild.id, msg, message);
				});
			}
		} catch (err) {
			console.log(`[ERROR] maxvolume.js: ${err.stack}`.red);
			sendErrorMessage(message.channel, "Failed to update this server's default max volume", err.message);
		}
	}
};