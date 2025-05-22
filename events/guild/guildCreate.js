//Import Modules
const config = require(`../../configs/config.json`);
const settings = require(`../../configs/settings.json`);
const mongoose = require('mongoose');
const Setting = require('../../models/Settings.js');
const {
	onCoolDown,
	replacemsg,
} = require(`../../handlers/functions`);
const Discord = require(`discord.js`);
const { Events } = require('discord.js');

module.exports = {
	name: Events.GuildCreate,
	execute: async (client, guild) => {
		try {
			const setting = await Setting.create({ _id: guild.id, prefix: config.prefix, guildName: guild.name, defaultVolume: 100, autoresume: true, defaultautoplay: false, defaultfilters: [], playlists: [], botChannel: "", firstMessage: true });
			console.log("Added to guild: " + guild.name);
		} catch (e) {
			console.log(String(e.stack).bgRed);
		}
	}
};