const { MessageEmbed, Collection, ActivityType, EmbedBuilder } = require("discord.js");
const Discord = require("discord.js");
const config = require("../configs/config.json");
const settings = require("../configs/settings.json");
const path = require("path");

module.exports.change_status = change_status;

function change_status(client) {
	const statusList = [`${config.prefix}help in ${client.guilds.cache.size} servers`, `BOT WORKING AGAIN! Sorry for the wait.`];
	const status = statusList[Math.floor(Math.random() * statusList.length)];
	try {
		client.user.setActivity(status, {
			type: ActivityType.Listening,
		}), 60000;
	} catch (e) {
		console.log(String(e.stack).bgRed);
	}
}