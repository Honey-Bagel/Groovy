// Template for converting existing commands to support both message and slash commands

/*
BEFORE (Message only):
module.exports = {
	name: "commandname",
	description: "Command description",
	execute: async (client, message, args) => {
		// command logic here
		message.channel.send("Hello!");
	}
};

AFTER (Both message and slash):
*/

const { SlashCommandBuilder } = require("discord.js");
const { sendResponse, sendError, deferResponse, getQuery, isSlashCommand } = require("../../utils/commandUtils.js");

module.exports = {
	name: "commandname",
	description: "Command description",
	aliases: ["alias1", "alias2"], // Optional aliases for message commands

	// Slash command data
	data: new SlashCommandBuilder()
		.setName('commandname')
		.setDescription('Command description')
		.addStringOption(option =>
			option.setName('parameter')
				.setDescription('Parameter description')
				.setRequired(true) // or false
		),

	// Message command execution
	execute: async (client, message, args) => {
		return executeCommand(client, { message, args });
	},

	// Slash command execution
	executeSlash: async (client, interaction) => {
		return executeCommand(client, { interaction });
	}
};

// Unified execution function
async function executeCommand(client, context) {
	try {
		// Check if it's a slash command
		const isSlash = isSlashCommand(context);

		// Get the parameter/query
		const parameter = getQuery(context, 'parameter'); // For slash commands
		// OR for message commands, manually get args:
		// const parameter = isSlash ? context.interaction.options.getString('parameter') : context.args.join(' ');

		// Defer response if needed (for slash commands)
		await deferResponse(context);

		// Your command logic here
		if (!parameter) {
			return sendError(context, "Missing Parameter", "Please provide a parameter!", client);
		}

		// Do something with the parameter
		const result = `You said: ${parameter}`;

		// Send response (works for both message and slash commands)
		return sendResponse(context, { content: result });

	} catch (error) {
		console.error(`[ERROR] Command failed:`, error);
		return sendError(context, "Command Failed", "An error occurred while executing this command.", client);
	}
}
