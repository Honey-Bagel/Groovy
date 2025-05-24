const { EmbedBuilder } = require("discord.js");
const ee = require("../../configs/embed.json");
const { hasValidChannel, isChannelFull, isUserInChannel, getAudioStream, isYTLink } = require("../../handlers/functions.js");
const { embedThen, sendErrorMessage } = require("../../handlers/functions.js");

module.exports = {
	name: "play",
	usage: "play <Search/Link>",
	aliases: ["p", "paly", "pley", "playsong", "song"],
	description: "Plays a song either from a link or a search term",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message, args) => {
		try {
			const { member, channelId, guildId } = message;
			const { guild } = member;
			const { channel } = member.voice;

			hasValidChannel(client, message, channel);
			isChannelFull(message, channel);
			isUserInChannel(message, channel);

			if(!args[0]) {
				return message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor(ee.wrongcolor)
							.setFooter(ee.footertext, ee.footericon)
							.setTitle(`${client.allEmojis.x} **Please provide a Query**`)
							.setDescription(`**Usage:**\n> \`${client.settings.get(message.guild.id, "prefix")}play <Search/Link>\``)
					]
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}

			const Text = args.join(" ");
			try {
				const queue = client.distube.getQueue(guildId);
				let options = {
					member: member,
				};
				if(!queue) {
					options.textChannel = guild.channels.cache.get(channelId);
				}
				client.distube.play(channel, Text, options);
			} catch(err) {
				console.log(err.stack ? err.stack : e);
				message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor(ee.wrongcolor)
							.setFooter(ee.footertext, ee.footericon)
							.setTitle(`${client.allEmojis.x} **An error occurred while trying to play the song!**`)
							.setDescription(`\`\`\`${err.message}\`\`\``)
					]
				}).then((msg) => {
					embedThen(guildId, msg, message);
				});
			}
		} catch (err) {
			console.error(`[ERROR] Failed to play song: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to play the song", err.message);
		}
	}
};