const { EmbedBuilder } = require('discord.js');

/**
 * Unified response handler for both message and slash commands
 * @param {Object} context - Context object containing either message or interaction
 * @param {Object} options - Response options (content, embeds, etc.)
 * @param {boolean} ephemeral - Whether the response should be ephemeral (slash commands only)
 */
async function sendResponse(context, options, ephemeral = false) {
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
		return await context.message.channel.send(options);
	}
}

/**
 * Send an error response
 * @param {Object} context - Context object containing either message or interaction
 * @param {string} title - Error title
 * @param {string} description - Error description
 * @param {Object} client - Discord client (for emojis and settings)
 */
async function sendError(context, title, description, client) {
	const source = context.interaction || context.message;
	const ee = require('../configs/embed.json');

	const errorEmbed = new EmbedBuilder()
		.setColor(ee.wrongcolor)
		.setTitle(`${client.allEmojis.x} **${title}**`)
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

/**
 * Get the query/arguments from either command type
 * @param {Object} context - Context object containing either message or interaction
 * @param {string} optionName - Name of the slash command option
 * @returns {string|null} The query string or null if not provided
 */
function getQuery(context, optionName = 'query') {
	if (context.interaction) {
		return context.interaction.options.getString(optionName);
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

module.exports = {
	sendResponse,
	sendError,
	deferResponse,
	getQuery,
	isSlashCommand
};
