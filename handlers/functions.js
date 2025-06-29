const { MessageEmbed, Collection, ActivityType, EmbedBuilder } = require("discord.js");
const Discord = require("discord.js");
const config = require("../configs/config.json");
const settings = require("../configs/settings.json");
const path = require("path");
const Setting = require("../models/Settings");
const ee = require("../configs/embed.json");
const emojis = require("../configs/emojis.json");
const { sendFollowUp, sendError } = require("../utils/commandUtils.js");
const Status = require("../models/Status");

module.exports.change_status = change_status;
module.exports.isChannelFull = isChannelFull;
module.exports.isUserInChannel = isUserInChannel;
module.exports.isQueueValid = isQueueValid;
module.exports.hasValidChannel = hasValidChannel;
module.exports.sendErrorMessage = sendErrorMessage;
module.exports.embedThen = embedThen;
module.exports.delay = delay;
module.exports.changeStatus = changeStatus;

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
	if (!options || options == undefined || options == null) return String(text);
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

function hasValidChannel(context, guild, channel) {
	if(!channel) {
		const embed = new EmbedBuilder()
			.setColor(ee.wrongcolor)
			.setTitle(`${emojis.x} **Please join ${guild.members.me.voice.channel ? "__my__" : "a"} VoiceChannel First.**`);

		sendFollowUp(context, { embeds: [ embed ] });
		return false;
	};
	return true;
}

function isChannelFull(context, channel) {
	if (channel.userLimit != 0 && channel.full) {
	   const embed = new EmbedBuilder()
	   		.setColor(ee.wrongcolor)
			.setTitle(`${emojis.x} Your Voice Channel is full, I can't join!`);

		sendFollowUp(context, { embeds: [ embed ] });
		return false;
	}
	return true;
}

function isUserInChannel(context, channel) {
  	if (channel.guild.members.me.voice.channel && channel.guild.members.me.voice.channel.id != channel.id) {
		const embed = new EmbedBuilder()
			.setColor(ee.wrongcolor)
			.setTitle(`${emojis.x} I am already connected somewhere else`);

		sendFollowUp(context, { embeds: [ embed ] });
		return false;
	}
	return true;
}

function isQueueValid(context, client, guildId) {
	if(!client.distube.getQueue(guildId)) {
		const embed = new EmbedBuilder()
			.setColor(ee.wrongcolor)
			.setTitle(`❌ ERROR | I am not playing Something`)
			.setDescription(`The queue is empty`);

		sendFollowUp(context, { embeds: [ embed ] });
		return false;
	}
	return true;
}

function sendErrorMessage(channel, title, message) {
	if(!channel) return;
	return channel.send({
		embeds: [new EmbedBuilder()
			.setColor(ee.wrongcolor)
			.setTitle(`${emojis.x} - ${title}`)
			.setDescription(message)
		]
	}).then((msg) => {
		setTimeout(() => {
			msg.delete().catch((e) => {
				//
			});
		}, 5000);
	});
}

async function embedThen(guildId, botEmbed, message) {
	const guildSettings = await Setting.findOne({ _id: guildId });
	if(!guildSettings) {
		console.log(`[ERROR] {Function} No Guild Settings found for ${guildId}`);
		return;
	}

	const { deleteUserMessages, deleteBotMessages, deleteAfter } = guildSettings;
	setTimeout(() => {
		if(deleteUserMessages) {
			message.delete().catch((e) => {
				//
			});
		}
		if(deleteBotMessages) {
			botEmbed.delete().catch((e) => {
				//
			});
		}
	}, deleteAfter ? deleteAfter : 5000);
}

function delay(delayInms) {
	try {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(2);
			}, delayInms);
		});
	} catch (e) {
		console.log(String(e.stack).bgRed);
	}
}

async function changeStatus(client, index) {
	try {
		const statusDoc = await Status.findById("botStatus");
		if(!statusDoc || statusDoc.statuses.length === 0) {
			console.log("[ERROR] No Statuses found in the database, returning default status");
			return 0;
		}

		const activityMap = {
			playing: ActivityType.Playing,
			watching: ActivityType.Watching,
			listening: ActivityType.Listening,
			competing: ActivityType.Competing
		};

		// Check bounds before accessing array
		if(index >= statusDoc.statuses.length) {
			index = 0; // Reset to start
		}

		const status = statusDoc.statuses[index];

		client.user.setActivity(eval('`' + status.message + '`'), {
			type: activityMap[status.type] || ActivityType.Listening,
		});

		// Return next index
		return index + 1;
	} catch (e) {
		console.log(`[ERROR] Failed to change status: ${e.stack}`.red);
		return 0;
	}
}