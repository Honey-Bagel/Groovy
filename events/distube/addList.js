const { Events } = require("distube");
const { EmbedBuilder } = require("discord.js");
const { sendErrorMessage } = require("../../handlers/functions.js");
const MusicHandler = require("../../handlers/musicHandler.js");
const musicHandler = MusicHandler.getInstance();

module.exports = {
	name: Events.ADD_LIST,
	execute: (queue, playlist, client) => {
		try {
			queue.textChannel.send({
				embeds: [ new EmbedBuilder()
					.setColor("Green")
					.setThumbnail(playlist.thumbnail.url ? playlist.thumbnail.url : `https://img.youtube.com/vi/${playlist.songs[0].id}/mqdefault.jp`)
					.setTitle(`${client.allEmojis.check_mark} **Playlist added to the queue!**`)
					.setDescription(`>>> Playlist: [\`${playlist.name}\`](${playlist.url ? playlist.url : ``})  -  \`${playlist.songs.length} Song${playlist.songs.length > 0 ? `s` : ``}\``)
					.addFields(
						{ name: `⌛ **Estimated Time:**`, value: `\`${playlist.songs.length}\` - \`${playlist.formattedDuration}\`` },
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
		} catch (err) {
			console.log(`[ERROR] {Events} Failed to add playlist to queue: ${err.message}`.red);
			sendErrorMessage(queue.textChannel, "Failed to add playlist", err.message);
		}
	}
};