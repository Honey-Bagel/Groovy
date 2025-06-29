const { Events } = require('discord.js');
const MusicHandler = require("../../handlers/musicHandler.js");
const musicHandler = MusicHandler.getInstance();
const { sendError } = require('../../utils/commandUtils.js');

module.exports = {
	name: Events.InteractionCreate,
	execute: async (interaction) => {
		if(interaction.isButton()) {
			const handled = await musicHandler.handleButtonInteraction(interaction);
			if(handled) return;
		}

		// Handle slash commands
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.slashCommands.get(interaction.commandName);

			if (!command) {
				console.error(`[ERROR] No slash command matching ${interaction.commandName} was found.`.red);
				return;
			}

			if(command.memberpermissions && command.memberpermissions.length > 0 && !interaction.member.permissions.has(command.memberpermissions)) {
				return sendError({ interaction }, "You do not have permission to use this command.", `**Required Permissions:**\n> \`${command.memberpermissions.join(', ')}\``);
			}

			try {
				// Execute the slash command
				await command.executeSlash(interaction.client, interaction);
			} catch (error) {
				console.error(`[ERROR] Error executing slash command ${interaction.commandName}:`.red, error);

				const errorMessage = 'There was an error while executing this command!';
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: errorMessage, ephemeral: true });
				} else {
					await interaction.reply({ content: errorMessage, ephemeral: true });
				}
			}
		}
	}
};