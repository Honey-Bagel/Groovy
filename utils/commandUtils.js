const { EmbedBuilder } = require('discord.js');
const emojis = require('../configs/emojis.json');

/**
 * Unified response handler for both message and slash commands
 * @param {Object} context - Context object containing either message or interaction
 * @param {Object} options - Response options (content, embeds, etc.)
 * @param {boolean} ephemeral - Whether the response should be ephemeral (slash commands only)
 */
async function sendResponse(context, options, ephemeral = false, deleteAfter = null) {
	if (context.interaction) {
		// Slash command response
		const responseOptions = { ...options };
		if (ephemeral) responseOptions.ephemeral = true;

		if (context.interaction.deferred) {
			return await context.interaction.editReply(responseOptions);
		} else if (context.interaction.replied) {
			return await context.interaction.followUp(responseOptions);
		} else {
			return await context.interaction.reply(responseOptions);
		}
	} else {
		// Message command response
		const response = await context.message.channel.send(options);

		if(deleteAfter && deleteAfter > 0) {
			setTimeout(async () => {
				try {
					await Promise.allSettled([
						context.message.delete(),
						response.delete()
					]);
				} catch (err) {
					console.log(`[ERROR] Failed to delete messages: ${err.stack}`.red);
				}
			}, deleteAfter);
		}
		return response;
	}
}

/**
 * Send an error response
 * @param {Object} context - Context object containing either message or interaction
 * @param {string} title - Error title
 * @param {string} description - Error description
 * @param {Object} client - Discord client (for emojis and settings)
 */
async function sendError(context, title, description, client = null) {
	const source = context.interaction || context.message;
	const ee = require('../configs/embed.json');

	const errorEmbed = new EmbedBuilder()
		.setColor(ee.wrongcolor)
		.setTitle(`${emojis.x} **${title}**`)
		.setDescription(description);

	return await sendResponse(context, { embeds: [errorEmbed] }, true);
}

/**
 * Defer the response for slash commands (no-op for message commands)
 * @param {Object} context - Context object containing either message or interaction
 */
async function deferResponse(context) {
	if (context.interaction && !context.interaction.deferred && !context.interaction.replied) {
		await context.interaction.deferReply();
	}
}

async function sendTempResponse(context, options, deleteAfter = 5000) {
	if (context.interaction) {
		return await sendResponse(context, options, true);
	} else {
		return await sendResponse(context, options, false, deleteAfter);
	}
}

async function sendFollowUp(context, options, deleteAfter = 5000) {
	if(context.interaction) {
		const followUp = await context.interaction.followUp({ ...options, ephemeral: false });

		if(deleteAfter && deleteAfter > 0) {
			setTimeout(async () => {
				try {
					await followUp.delete();
				} catch (err) {
					console.log(`[ERROR] Failed to delete follow-up message: ${err.stack}`.red);
				}
			}, deleteAfter);
		}
		return followUp;
	} else {
		return await sendTempResponse(context, options, deleteAfter);
	}
}

/**
 * Get the query/arguments from either command type
 * @param {Object} context - Context object containing either message or interaction
 * @param {string} optionName - Name of the slash command option
 * @returns {string|null} The query string or null if not provided
 */
function getQuery(context, optionName = 'query') {
	if (context.interaction) {
		const option = context.interaction.options.get(optionName);
		if(!option) return null;
		const { value } = option;
		return value;
	} else {
		return context.args && context.args.length > 0 ? context.args.join(' ') : null;
	}
}

/**
 * Check if the context is from a slash command
 * @param {Object} context - Context object containing either message or interaction
 * @returns {boolean} True if it's a slash command
 */
function isSlashCommand(context) {
	return !!context.interaction;
}

/**
 * Extracts common properties from both message and slash command contexts
 * @param {Object} context - Context object containing either message or interaction
 * @returns {Object} Extracted data including member, channelId, guildId, args, and isSlash
 */
function extractContextData(context) {
	const isSlash = isSlashCommand(context);

	if(isSlash) {
		const { interaction } = context;
		return {
			member: interaction.member,
			user: interaction.user,
			guild: interaction.guild,
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			channel: interaction.channel,
			voiceChannel: interaction.member?.voice?.channel,
			isSlash: true,
			interaction
		};
	} else {
		const { message } = context;
		return {
			member: message.member,
			user: message.author,
			guild: message.guild,
			guildId: message.guild.id,
			channelId: message.channel.id,
			channel: message.channel,
			voiceChannel: message.member?.voice?.channel,
			isSlash: false,
			message,
			args: context.args
		};
	}
}

/**
 * Creates a context wrapper with helper methods for easier access
 * @param {Object} context - Context object containing either message or interaction
 * @returns {Object} Context wrapper with helper methods
 */
function createContextWrapper(context) {
	const data = extractContextData(context);

	return {
		...data,

		getParameter(name, fallbackToArgs = false) {
			if(data.isSlash) {
				return context.interaction.options.getString(name);
			} else if(fallbackToArgs && data.args) {
				return data.args.join(' ');
			}
			return null;
		},

		hasVoiceChannel() {
			return !!data.voiceChannel;
		},

		canUseVoiceChannel() {
			return data.voiceChannel && data.voiceChannel.full;
		},

		async reply(content) {
			return sendResponse(context, content);
		},

		async error(title, description) {
			return sendError(context, title, description, this.client);
		}
	};
}

module.exports = {
	sendResponse,
	sendError,
	deferResponse,
	getQuery,
	isSlashCommand,
	extractContextData,
	createContextWrapper,
	sendFollowUp
};
