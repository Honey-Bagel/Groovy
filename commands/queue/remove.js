const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "remove",
	usage: "remove <position> | remove <position> <count>",
	aliases: ["delete", "del", "rm"],
	description: "Removes a song or multiple songs from the queue by their position(s)",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message, args) => {
		const { member, channelId, guildId } = message;
		const { guild } = member;
		const { channel } = member.voice;

		hasValidChannel(guild, message, channel);
		isUserInChannel(message, channel);
		isQueueValid(client, message);

		try {
			let newQueue = client.distube.getQueue(guildId);
			if (!args[0]) {
				return message.channel.send({
					embeds: [new EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setTitle(`${client.allEmojis.x} **Please provide a position to remove the song!**`)
						.setDescription(`**Usage:**\n> \`${client.settings.get(message.guild.id, "prefix")}remove <position> | remove <position> <count> | remove <pos1> <pos2> <pos3>...\``)
					],
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			let songIndex = Number(args[0]);

			let amount = Number(args[1] ? args[1] : 1);
			if(!amount) amount = 1;
			if (songIndex < 1 || songIndex > newQueue.songs.length) {
				return message.channel.send({
					embeds: [new EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setTitle(`${client.allEmojis.x} **Invalid position provided!**`)
						.setDescription(`**Valid range:** 1 - ${newQueue.songs.length}`)
					],
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			if(amount < 1) {
				return message.channel.send({
					embeds: [new EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setTitle(`${client.allEmojis.x} **Amount must be at least 1!**`)
					],
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			newQueue.songs.splice(songIndex, amount);
			return message.channel.send({
				embeds: [new EmbedBuilder()
					.setColor("Green")
					.setTitle(`🗑 Removed ${amount} Song${amount > 1 ? "s" : ""} from the Queue`)
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] remove.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to remove the song(s) from the queue", err.message);
		}
	}
};