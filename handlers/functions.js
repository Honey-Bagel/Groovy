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

module.exports.replacemsg = replacedefaultmessages;
/**
 *
 * @param {*} text The Text that should be replaced, usually from /botconfig/settings.json
 * @param {*} options Those Options are what are needed for the replaceMent! Valid ones are: {
 *   timeLeft: "",
 *   commandmemberpermissions: { memberpermissions: [] },
 *   commandalloweduserids: { alloweduserids: [] },
 *   commandrequiredroles: { requiredroles: [] },
 *   commandname: { name: "" },
 *   commandaliases: { aliases: [] },
 *   prefix: "",
 *   errormessage: { message: "" }
 *   errorstack: { stack: STACK }
 *   error: ERRORTYPE
 * }
 * @returns STRING
 */
function replacedefaultmessages(text, o = {}) {
	if (!text || text == undefined || text == null) throw "No Text for the replacedefault message added as First Parameter";
 	const options = Object(o);
	if (!options || options == undefined || options == null) return String(text)
 	 	return String(text)
		.replace(/%{timeleft}%/gi, options && options.timeLeft ? options.timeLeft.toFixed(1) : "%{timeleft}%")
		.replace(/%{commandname}%/gi, options && options.command && options.command.name ? options.command.name : "%{commandname}%")
		.replace(/%{commandaliases}%/gi, options && options.command && options.command.aliases ? options.command.aliases.map(v => `\`${v}\``).join(",") : "%{commandaliases}%")
		.replace(/%{prefix}%/gi, options && options.prefix ? options.prefix : "%{prefix}%")
		.replace(/%{commandmemberpermissions}%/gi, options && options.command && options.command.memberpermissions ? options.command.memberpermissions.map(v => `\`${v}\``).join(",") : "%{commandmemberpermissions}%")
		.replace(/%{commandalloweduserids}%/gi, options && options.command && options.command.alloweduserids ? options.command.alloweduserids.map(v => `<@${v}>`).join(",") : "%{commandalloweduserids}%")
		.replace(/%{commandrequiredroles}%/gi, options && options.command && options.command.requiredroles ? options.command.requiredroles.map(v => `<@&${v}>`).join(",") : "%{commandrequiredroles}%")
		.replace(/%{errormessage}%/gi, options && options.error && options.error.message ? options.error.message : options && options.error ? options.error : "%{errormessage}%")
		.replace(/%{errorstack}%/gi, options && options.error && options.error.stack ? options.error.stack : options && options.error && options.error.message ? options.error.message : options && options.error ? options.error : "%{errorstack}%")
		.replace(/%{error}%/gi, options && options.error ? options.error : "%{error}%");
}