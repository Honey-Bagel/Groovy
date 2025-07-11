const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

class MusicHandler {
	constructor() {
		if(MusicHandler.instance) {
			return MusicHandler.instance;
		}

		this.client = null;
		this.distube = null;
		this.guildData = new Map();
		this.timers = new Map();

		MusicHandler.instance = this;
	}

	initialize(client, distube) {
		this.client = client;
		this.distube = distube;
	}

	static getInstance() {
		if(!MusicHandler.instance) {
			MusicHandler.instance = new MusicHandler();
		}
		return MusicHandler.instance;
	}

	getGuildData(guildId) {
		if(!this.guildData.has(guildId)) {
			this.guildData.set(guildId, {
				nowPlayingMessage: null,
				queueMessage: null,
				textChannel: null,
				queuePage: 0,
				queueListOpen: false,
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

		this.stopTimer(guildId);

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

	createNowPlayingEmbed(track, queue, color = null) {
		const embed = new EmbedBuilder()
			.setColor(color ? color : "Random")
			.setThumbnail(track.source === 'spotify' ? track.stream?.song?.thumbnail : track.thumbnail)
			//.setDescription(`See the [Queue on the **Dashboard** Live!](${require('../dashboard/settings.json').website.domain}/queue/${queue.id})`)
			.setDescription(`See the Queue on the **Dashboard** Live! _disabled_`)
			.addFields({ name: `💡 Requested by:`, value: `>>> ${track.user}`, inline: true },
				{ name: `⏱ Duration:`, value: `>>> \`${queue.formattedCurrentTime} / ${track.formattedDuration}\``, inline: true },
				{ name: `🌀 Queue:`, value: `>>> \`${queue.songs.length} song(s)\`\n\`${queue.formattedDuration}\``, inline: true },
				{ name: `🔊 Volume:`, value: `>>> \`${queue.volume} %\``, inline: true },
				{ name: `♾ Loop:`, value: `>>> ${queue.repeatMode ? (queue.repeatMode === 2 ? `${this.client.allEmojis.check_mark}\` Queue\`` : `${this.client.allEmojis.check_mark} \`Song\``) : `${this.client.allEmojis.x}`}`, inline: true },
				{ name: `↪️ Autoplay:`, value: `>>> ${queue.autoplay ? `${this.client.allEmojis.check_mark}` : `${this.client.allEmojis.x}`}`, inline: true },
				{ name: `❔ Song Link:`, value: `>>> [\`Click here\`](${track.url})`, inline: true },
				{ name: `❔ Filter${queue.filters.length > 0 ? `s` : ``}:`, value: `>>> ${queue.filters && queue.filters.length > 0 ? `${queue.filters.map((f) => `\`${f}\``).join(`, `)}` : `${this.client.allEmojis.x}`}`, inline: queue.filters.length > 1 ? false : true }
			)
			.setAuthor({
				name: `${track.name}`,
				iconURL: queue.isPaused() ? `https://cdn.discordapp.com/emojis/859459305152708630.png` : `https://images-ext-1.discordapp.net/external/DkPCBVBHBDJC8xHHCF2G7-rJXnTwj_qs78udThL8Cy0/%3Fv%3D1/https/cdn.discordapp.com/emojis/859459305152708630.gif`,
				url: track.stream?.song?.url || track.url
			})
			.setFooter({
				text: `${track.user.tag}`,
				iconURL: track.user.displayAvatarURL({ dynamic: true })
			});
		return embed;
	}

	createQueueEmbed(queue, page = 0) {
		const embed = new EmbedBuilder()
			.setTitle('📋 Queue')
			.setColor('#0099ff')
			.setDescription('Fetching queue...');

		if (queue.songs.length === 0) {
			embed.setDescription('Queue is empty');
			return { embed, totalPages: 0 };
		} else {
			embed.setDescription(`Total songs in queue: ${queue.songs.length - 1}`); // -1 to exclude current song
		}

		const songsPerPage = 10;
		const totalPages = Math.ceil((queue.songs.length - 1) / songsPerPage); // -1 because current song isn't paginated

		// Ensure page is within bounds
		page = Math.max(0, Math.min(page, totalPages - 1));

		// Show current song (always visible)
		const current = queue.songs[0];

		// Show upcoming songs for current page
		const startIdx = 1 + (page * songsPerPage); // +1 to skip current song
		const endIdx = Math.min(startIdx + songsPerPage, queue.songs.length);
		const songsOnPage = queue.songs.slice(startIdx, endIdx);

		let queueDescription = `🎵 **Currently Playing**\n**[${current.name}](${current.url})**\nDuration: ${current.formattedDuration} | Requested by: ${current.user?.displayName || current.user?.username}\n`;

		if (songsOnPage.length > 0) {
			queueDescription += `📝 **Up Next Page ${page + 1}/${totalPages}**\n`;
			songsOnPage.forEach((song, index) => {
				const position = startIdx + index;
				const songTitle = song.name.length > 50 ? song.name.substring(0, 47) + '...' : song.name;

				queueDescription += `${position}. **[${songTitle}](${song.url})**\n` +
					`Duration: ${song.formattedDuration} | Requested by: ${song.user?.displayName || song.user?.username}\n`;
			});

			embed.setDescription(queueDescription);
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

		const embed = this.createNowPlayingEmbed(track, queue, guildData.nowPlayingMessage?.embeds[0]?.color);

		try {
			if(guildData.nowPlayingMessage) {
				await guildData.nowPlayingMessage.edit({ embeds: [embed] });
			} else {
				const message = await guildData.textChannel.send({ embeds: [embed] });
				this.updateGuildData(guildId, { nowPlayingMessage: message });
			}
		} catch (error) {
			this.updateGuildData(guildId, { nowPlayingMessage: null });
			// If the message edit fails, we log the error and reset the now playing message
			// This is important to avoid memory leaks and stale messages
			console.error(`[ERROR] Failed to update now playing message: ${error.stack}`.red);
		}
	}

	async updateQueueMessage(guildId, queue, page = -1) {
		const guildData = this.getGuildData(guildId);
		if(!guildData.textChannel) return;
		if(!guildData.queueListOpen) return; // Don't update if queue list is closed

		if(page === -1 && (guildData.queuePage != null || guildData.queuePage != undefined)) {
			page = guildData.queuePage;
		}

		const { embed, totalPages, currentPage } = this.createQueueEmbed(queue, page);

		this.updateGuildData(guildId, { queuePage: page });

		const buttons = this.createQueueButtons(currentPage, totalPages, guildId);
		const messageOptions = { embeds: [embed] };
		if (buttons) messageOptions.components = [buttons];

		try {
			if(guildData.queueMessage) {
				await guildData.queueMessage.edit(messageOptions);
			} else {
				const message = await guildData.textChannel.send(messageOptions);
				this.updateGuildData(guildId, { queueMessage: message, queuePage: page });
			}
		} catch (error) {
			this.updateGuildData(guildId, { queueMessage: null });
			// If the message edit fails, we log the error and reset the queue message
			console.error(`[ERROR] Failed to update queue message: ${error.stack}`.red);
		}
	}

	setTextChannel(guildId, channel) {
		this.updateGuildData(guildId, { textChannel: channel });
	}

	createQueueButtons(currentPage, totalPages, guildId) {
		if (totalPages <= 1) return null;

		const row = new ActionRowBuilder();

		// Previous page button
		row.addComponents(
			new ButtonBuilder()
				.setCustomId(`queue_prev_${guildId}`)
				.setLabel('◀️ Previous')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(currentPage === 0)
		);

		// Page indicator
		row.addComponents(
			new ButtonBuilder()
				.setCustomId(`queue_page_${guildId}`)
				.setLabel(`${currentPage + 1}/${totalPages}`)
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true)
		);

		// Next page button
		row.addComponents(
			new ButtonBuilder()
				.setCustomId(`queue_next_${guildId}`)
				.setLabel('Next ▶️')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(currentPage === totalPages - 1)
		);

		return row;
	}

	// Handle button interactions
	async handleButtonInteraction(interaction) {
		if (!interaction.customId.startsWith('queue_')) return false;

		const guildId = interaction.guild.id;
		const queue = this.distube.getQueue(guildId);

		if (!queue) {
			await interaction.reply({ content: 'No queue found!', ephemeral: true });
			return true;
		}

		const guildData = this.getGuildData(guildId);
		let newPage = guildData.queuePage;

		if (interaction.customId.includes('prev')) {
			newPage = Math.max(0, guildData.queuePage - 1);
		} else if (interaction.customId.includes('next')) {
			const { totalPages } = this.createQueueEmbed(queue, 0);
			newPage = Math.min(totalPages - 1, guildData.queuePage + 1);
		} else {
			// Page indicator button - just acknowledge
			await interaction.deferUpdate();
			return true;
		}

		// Update the queue message with new page
		this.updateGuildData(guildId, { queuePage: newPage });
		await this.updateQueueMessage(guildId, queue, newPage);
		await interaction.deferUpdate();

		return true;
	}

	startTimer(guildId) {
		this.stopTimer(guildId);

		const timer = setInterval(async () => {
			const queue = this.distube.getQueue(guildId);

			if(!queue || !queue.playing || queue.paused) {
				return;
			}

			const currentSong = queue.songs[0];
			if(currentSong) {
				await this.updateNowPlayingMessage(guildId, currentSong, queue);
			}
		}, 5000); // Every 5 seconds

		this.timers.set(guildId, timer);
	}

	stopTimer(guildId) {
		const timer = this.timers.get(guildId);
		if(timer) {
			clearInterval(timer);
			this.timers.delete(guildId);
		}
	}
}

module.exports = MusicHandler;