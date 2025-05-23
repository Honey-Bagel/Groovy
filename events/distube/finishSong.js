const { Events } = require("distube");
const { EmbedBuilder } = require("discord.js");
const MusicHandler = require("../../handlers/musicHandler.js");
const musicHandler = MusicHandler.getInstance();

module.exports = {
	name: Events.FINISH_SONG,
	execute: (queue, song, client) => {
		// Do nothing, nothing to handle as of right now
	}
};