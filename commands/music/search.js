const { EmbedBuilder } = require('discord.js');
const ee = require('../../configs/embed.json');
const { hasValidChannel, isUserInChannel, isQueueValid } = require('../../handlers/functions.js');
const { sendErrorMessage, embedThen } = require('../../handlers/functions.js');

module.exports = {
	name: "search",
	usage: "search <query>",
	aliases: ["find", "srch", "lookup", "findsong"],
	description: "Search for a song",
	memberpermissions: [],
	requiredroles: [],
	alloweduserids: [],
	execute: async (client, message, args) => {
		try {

			if(!args.length) {
				return sendErrorMessage(message.channel, "Please provide a search query", "").then((msg) => {
					embedThen(message.guildId, msg, message);
				});
			}
			if(message.channel.activeCollector) {
				return sendErrorMessage(message.channel, "Please wait for the current search to finish", "").then((msg) => {
					embedThen(message.guildId, msg, message);
				});
			}
			hasValidChannel(message.guild, message, message.member.voice.channel);
			isUserInChannel(message, message.member.voice.channel);

			const search = args.join(" ");

			let resultsEmbed = new EmbedBuilder()
				.setTitle(`**Reply with the song number you want to play** (type cancel to stop search)`)
				.setDescription(`Results for: ${search}`)
				.setColor("#F8AA2A");

			let resultsArray = [];

			const results = await client.distube.search(search, { type: "video", limit: 10, safeSearch: false });

			results.map((video, index) => {
				resultsEmbed.addFields([
					{ name: `${video.shortURL}`, value: `${index + 1}. ${video.title} ${video.duration}` }
				]);
			});

			let resultsMessage = await message.chhanel.send({ embeds: [ resultsEmbed ] });

			function filter(msg) {
				const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/;
				return pattern.test(msg.content);
			}

			message.channel.activeCollector = true;
			const collector = await message.channel.createMessageCollector({
				filter, max: 1, time: 10000, errors: ["time"]
			});

			collector.on("collect", async i => {
				if(i.content == "cancel") {
					collector.stop();
				} else if(i.content.includes(",")) {
					let songs = i.split(",").map((str) => str.trim());

					for(let song of songs) {
						await message.client.commands.get("play").execute(message, [ resultsEmbed.fields[parseInt(song) - 1].name]);
					}
				} else {
					const choice = resultsEmbed.data.fields[parseInt(i.content) - 1].name;
					client.distube.play(message.member.voice.channel, choice, {
						member: message.member,
						textChannel: message.channel
					});
				}

				message.channel.activeCollector = false;
				resultsMessage.delete().catch(console.error);
				i.delete().catch(console.error);
				collector.stop();
			});

		} catch (err) {
			console.log(`[ERROR] search.js: ${err.message}`.red);
			sendErrorMessage(message.channel, "Failed to search for a song", err.message).then((msg) => {
				embedThen(message.guildId, msg, message);
			});
		}
	}
};