const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

class MusicHandler {
	constructor(client, distube) {
		this.client = client;
		this.distube = distube;
		this.guildData = new Map();
	}

	getGuildData(guildId) {
		if(!this.guildData.has(guildId)) {
			this.guildData.set(guildId, {
				nowPlayingMessage: null,
				queueMessage: null,
				textChannel: null
			});
		}
		return this.guildData.get(guildId);
	}

	updateGuildData(guildId, data) {
		const guildData = this.getGuildData(guildId);
		Object.assign(guildData, data);
	}

	cleanupGuild(guildId) {
		const guildData = this.getGuildData(guildId);

		if(guildData.nowPlayingMessage) {
			guildData.nowPlayingMessage.delete().catch((e) => {
				console.log(`[ERROR] Failed to delete now playing message:`.red);
			});
		}
		if(guildData.queueMessage) {
			guildData.queueMessage.delete().catch((e) => {
				console.log(`[ERROR] Failed to delete queue message:`.red);
			});
		}

		this.guildData.delete(guildId);
	}

	createNowPlayingEmbed(track, queue) {
		const embed = new EmbedBuilder()
			.setColor("Random")
			.setDescription(`See the [Queue on the **Dashboard** Live!](${require('../dashboard/settings.json').website.domain}/queue/${queue.id})`)
			.addFields({ name: `💡 Requested by:`, value: `>>> ${newTrack.user}`, inline: true },
				{ name: `⏱ Duration:`, value: `>>> \`${newQueue.formattedCurrentTime} / ${newTrack.formattedDuration}\``, inline: true },
				{ name: `🌀 Queue:`, value: `>>> \`${newQueue.songs.length} song(s)\`\n\`${newQueue.formattedDuration}\``, inline: true },
				{ name: `🔊 Volume:`, value: `>>> \`${newQueue.volume} %\``, inline: true },
				{ name: `♾ Loop:`, value: `>>> ${newQueue.repeatMode ? (newQueue.repeatMode === 2 ? `${client.allEmojis.check_mark}\` Queue\`` : `${client.allEmojis.check_mark} \`Song\``) : `${client.allEmojis.x}`}`, inline: true },
				{ name: `↪️ Autoplay:`, value: `>>> ${newQueue.autoplay ? `${client.allEmojis.check_mark}` : `${client.allEmojis.x}`}`, inline: true },
				{ name: `❔ Song Link:`, value: `>>> [\`Click here\`](${newTrack.url})`, inline: true },
				{ name: `❔ Filter${newQueue.filters.length > 0 ? `s` : ``}:`, value: `>>> ${newQueue.filters && newQueue.filters.length > 0 ? `${newQueue.filters.map((f) => `\`${f}\``).join(`, `)}` : `${client.allEmojis.x}`}`, inline: newQueue.filters.length > 1 ? false : true }
			)
			.setAuthor({
				name: `${track.name}`,
				iconURL: `https://images-ext-1.discordapp.net/external/DkPCBVBHBDJC8xHHCF2G7-rJXnTwj_qs78udThL8Cy0/%3Fv%3D1/https/cdn.discordapp.com/emojis/859459305152708630.gif`,
				url: track.url
			})
			.setFooter({
				text: `${track.user.tag}`,
				iconURL: track.user.displayAvatarURL({ dynamic: true })
			});
	}

	createQueueEmbed(queue, page = 0) {
		const embed = new EmbedBuilder()
			.setTitle('📋 Queue')
			.setColor('#0099ff');

		if (queue.songs.length === 0) {
			embed.setDescription('Queue is empty');
			return { embed, totalPages: 0 };
		}

		const songsPerPage = 10;
		const totalPages = Math.ceil((queue.songs.length - 1) / songsPerPage); // -1 because current song isn't paginated

		// Ensure page is within bounds
		page = Math.max(0, Math.min(page, totalPages - 1));

		// Show current song (always visible)
		const current = queue.songs[0];
		embed.addFields({
			name: '🎵 Currently Playing',
			value: `**[${current.name}](${current.url})**\n` +
                   `Duration: ${current.formattedDuration} | Requested by: ${current.user?.displayName || current.user?.username}`,
			inline: false
		});

		// Show upcoming songs for current page
		const startIdx = 1 + (page * songsPerPage); // +1 to skip current song
		const endIdx = Math.min(startIdx + songsPerPage, queue.songs.length);
		const songsOnPage = queue.songs.slice(startIdx, endIdx);

		if (songsOnPage.length > 0) {
			const upcomingList = songsOnPage.map((song, index) => {
				const position = startIdx + index;
				return `${position}. **[${song.name}](${song.url})**\n` +
                       `Duration: ${song.formattedDuration} | Requested by: ${song.user?.displayName || song.user?.username}`;
			}).join('\n\n');

			const pageInfo = totalPages > 1 ? ` (Page ${page + 1}/${totalPages})` : '';
			embed.addFields({
				name: `📝 Up Next${pageInfo}`,
				value: upcomingList.length > 1024 ? upcomingList.substring(0, 1021) + '...' : upcomingList,
				inline: false
			});
		} else if (totalPages > 1) {
			embed.addFields({
				name: `📝 Up Next (Page ${page + 1}/${totalPages})`,
				value: 'No songs on this page',
				inline: false
			});
		}

		// Add queue stats
		const totalDuration = queue.songs.reduce((total, song) => total + song.duration, 0);
		const hours = Math.floor(totalDuration / 3600);
		const minutes = Math.floor((totalDuration % 3600) / 60);
		const seconds = totalDuration % 60;
		const formattedTotal = hours > 0 ?
			`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` :
			`${minutes}:${seconds.toString().padStart(2, '0')}`;

		embed.setFooter({ text: `Total songs: ${queue.songs.length} | Total duration: ${formattedTotal}` });

		return { embed, totalPages, currentPage: page };
	}

	async updateNowPlayingMessage(guildId, track, queue) {
		const guildData = this.getGuildData(guildId);
		if(!guildData.textChannel) return;

		const embed = this.createNowPlayingEmbed(track, queue);

		try {
			if(guildData.nowPlayingMessage) {
				await guildData.nowPlayingMessage.edit({ embeds: [embed] });
			} else {
				const message = await guildData.textChannel.send({ embeds: [embed] });
				this.updateGuildData(guildId, { nowPlayingMessage: message });
			}
		} catch (error) {
			console.error(`[ERROR] Failed to update now playing message: ${error.message}`.red);
		}
	}

	async updateQueueMessage(guildId, queue) {
		const guildData = this.getGuildData(guildId);
		if(!guildData.textChannel) return;

		const embed = this.createQueueEmbed(queue);

		try {
			if(guildData.queueMessage) {
				await guildData.queueMessage.edit({ embeds: [embed] });
			} else {
				const message = await guildData.textChannel.send({ embeds: [embed] });
				this.updateGuildData(guildId, { queueMessage: message });
			}
		} catch (error) {
			console.error(`[ERROR] Failed to update queue message: ${error.message}`.red);
		}
	}

	setTextChannel(guildId, channel) {
		this.updateGuildData(guildId, { textChannel: channel });
	}
}