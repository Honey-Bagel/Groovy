const fs = require('fs');
const path = require('path');
const colors = require('colors');

module.exports = (client) => {
	try {
		const commandFolders = fs.readdirSync('./commands');

		for (const folder of commandFolders) {
			const commandsPath = path.join(`./commands/${folder}/`);
			const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
			for (const file of commandFiles) {
				const filePath = path.join(commandsPath, file);
				const command = require(filePath);

				if('data' in command && 'execute' in command) {
					client.commands.set(command.data.name, command);
				} else {
					console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
				}
			}
		}
	} catch (e) {
		console.error(`${e.message}`.red);
	}
};