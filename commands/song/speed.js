const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');
const FiltersSettings = require("../../configs/filters.json");

module.exports = {
	name: "speed",
	usage: "speed <SpeedAmount>",
	aliases: ["customspeed", "changespeed", "cspeed"],
	description: "Changes the playback speed of the current song",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message, args) => {
		try {
			const { member, guildId } = message;
			const { guild } = member;
			const { channel } = member.voice;
			hasValidChannel(client, message, channel);
			isUserInChannel(message, channel);
			isQueueValid(client, message);

			let newQueue = client.distube.getQueue(guildId);
			if(!args[0]) {
				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor(ee.wrongcolor)
							.setTitle(`${client.allEmojis.x} **Please provide a speed amount**`)
					]
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			let speedAmount = args[0];

			FiltersSettings.speed = `atempo=${speedAmount}`;
			client.distube.filters = FiltersSettings;

			if(args[0] === 'off' && newQueue.filters?.length) {
				newQueue.setFilter(false);
			}
			else if(newQueue.filters.has("speed")) {
				await newQueue.filters.add(["speed"]);
			}
			await newQueue.filters.add(["speed"]);
			return message.channel.send({
				embeds: [new EmbedBuilder()
					.setColor("Green")
					.setTitle(`⏩ | Set the speed to \`${speedAmount}\``)
					.setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
				]
			}).then((msg) => {
				embedThen(guildId, msg, message);
			});

		} catch (err) {
			console.error(`[ERROR] speed.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to change playback speed", err.message);
		}
	}
};