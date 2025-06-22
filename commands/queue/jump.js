const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "jump",
	usage: "jump <number>",
	aliases: ["goto", "skipto",],
	description: "Jumps to a specific song in the queue",
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
			if (!newQueue || newQueue.songs.length === 0) {
				return message.channel.send({
					embeds: [new EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setTitle(`${client.allEmojis.x} **No songs in the queue**`)
					]
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			if(!args[0]) {
				return message.channel.send({
					embeds: [new EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setTitle(`${client.allEmojis.x} **Please add a Position to jump to!**`)
						.setDescription(`**Usage:**\n> \`${client.settings.get(message.guild.id, "prefix")}jump <position>\``)
					],
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			let position = Number(args[0]);
			if(position > newQueue.songs.length - 1 || position < 0) {
				return message.channel.send({
					embeds: [new EmbedBuilder()
						.setColor(ee.wrongcolor)
						.setTitle(`${client.allEmojis.x} **Invalid position!**`)
						.setDescription(`**Please provide a valid position between 1 and ${newQueue.songs.length - 1}.**`)
					]
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			await newQueue.jump(position);
			let posEnd = "";
			switch(position) {
			case 1:
				posEnd = "st";
				break;
			case 2:
				posEnd = "nd";
				break;
			case 3:
				posEnd = "rd";
				break;
			default:
				posEnd = `th`;
			};

			return message.channel.send({
				embeds: [new EmbedBuilder()
					.setColor("Green")
					.setTitle(`⏭️ | Jumped to the **${position}${posEnd}** song in the queue`)
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});
		} catch (err) {
			console.log(`[ERROR] jump.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to jump to the specified song", err.message);
		}
	}
};