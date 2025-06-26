const fs = require('fs');
const path = require('path');
const colors = require('colors');
const { REST, Routes } = require('discord.js');

module.exports = (client) => {
	try {
		let slashCommandsData = [];
		let amount = 0;
		const commandFolders = fs.readdirSync('./commands');

		// Load slash commands from existing command files
		for (const folder of commandFolders) {
			const commandsPath = path.join(`./commands/${folder}/`);
			const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
			for (const file of commandFiles) {
				const filePath = `../commands/${folder}/${file}`;
				const command = require(filePath);
				if(!command) continue;

				// If command has slash command data, add it
				if(command.data) {
					client.slashCommands.set(command.data.name, command);
					slashCommandsData.push(command.data.toJSON());
					amount++;
				}
			}
		}

		console.log(`[INFO] Loaded ${amount} slash commands`.blue);

		// Register slash commands with Discord
		if (slashCommandsData.length > 0) {
			registerSlashCommands(client, slashCommandsData);
		}
	} catch (e) {
		console.error(`[ERROR] Slash Command Handler: ${e.stack}`.red);
	}
};

async function registerSlashCommands(client, commandsData) {
	try {
		const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

		console.log('[INFO] Started refreshing application (/) commands.'.yellow);

		const guildId = '694361707476287540';

		if(process.env.NODE_ENV === 'development' && guildId) {
			const commands = [];
			for(const command of commandsData) {
				if(commands.includes(command.name)) {
					console.log(`[WARNING] Duplicate command name found: ${command.name}`.yellow);
					continue;
				}
				commands.push(command.name);
			}
			await rest.put(
				Routes.applicationGuildCommands(client.user.id, guildId),
				{ body: commandsData }
			);
			console.log('[INFO] Successfully reloaded guild (/) commands.'.green);
		} else {
			await rest.put(
				Routes.applicationCommands(client.user.id),
				{ body: commandsData }
			);

			console.log('[INFO] Successfully reloaded global (/) commands.'.green);
		}

	} catch (error) {
		console.error('[ERROR] Failed to register slash commands:'.red, error);
	}
}