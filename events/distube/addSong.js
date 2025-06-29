const { Events } = require("distube");
const { EmbedBuilder } = require("discord.js");
const MusicHandler = require("../../handlers/musicHandler.js");
const { sendErrorMessage } = require("../../handlers/functions.js");
const musicHandler = MusicHandler.getInstance();

module.exports = {
	name: Events.ADD_SONG,
	execute: (queue, song, client) => {
		try {
			queue.textChannel.send({
				embeds: [ new EmbedBuilder()
					.setColor("Green")
					.setThumbnail(
						song.thumbnail || `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`
					)
					.setTitle(`${client.allEmojis.check_mark} **Song added to queue**`)
					.setDescription(`>>> Song: [\`${song.name}\`](${song.url}) - \`${song.formattedDuration}\``)
					.addFields(
						{ name: `⌛ **Estimated Time:**`, value: `\`${queue.songs.length - 1} song${queue.songs.length > 0 ? `s` : ``}\` - \`${(Math.floor(((queue.duration - song.duration) / 60) * 100) / 100).toString().replace(`.`, `:`)}\`` },
                		{ name: `🌀 **Queue Duration:**`, value: `\`${queue.formattedDuration}\`` }
					)
				]
			}).then((msg) => {
				setTimeout(() => {
					msg.delete().catch((e) => {
						//
					});
				}, 5000);
			});

			musicHandler.updateQueueMessage(queue.voiceChannel.guildId, queue);
		} catch (err) {
			console.log(`[ERROR] {Events} Failed to add song to queue: ${err.message}`.red);
			sendErrorMessage(queue.textChannel, "Failed to add song", err.message);
		}
	}
};