//Import Modules
const config = require(`../../configs/config.json`);
const settings = require(`../../configs/settings.json`);
const mongoose = require("mongoose");
const Setting = require("../../models/Settings.js");
const {
	onCoolDown,
	replacemsg,
} = require(`../../handlers/functions`);
const Discord = require(`discord.js`);
const { Events } = require('discord.js');

module.exports = {
	name: Events.GuildDelete,
	execute: async (client, guild) => {
		Setting.findOneAndDelete({ _id: guild.id });
		console.log('Guild Delete', guild.id);
	}
};