const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { sendErrorMessage } = require('../../handlers/functions');

module.exports = {
	name: "invite",
	usage: "invite",
	aliases: ["inv", "addme"],
	description: "Get the invite link for the bot",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message) => {
		try {
			await message.author.send({
				embeds: [new EmbedBuilder()
					.setColor(ee.color)
					.setTitle(`${client.allEmojis.invite} **Invite me to your server!**`)
					.setDescription(`[Click here to invite me!](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands)`)
				]
			});

			return message.delete().catch(() => {
				//
			});
		} catch (err) {
			console.log(`[ERROR] invite.js: ${err.stack}`.red);
			sendErrorMessage(message.channel, "Failed to send invite link", err.message);
		}
	}
};