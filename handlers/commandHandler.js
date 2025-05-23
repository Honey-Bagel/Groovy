const fs = require('fs');
const path = require('path');
const colors = require('colors');

module.exports = (client) => {
	try {
		let amount = 0;
		const commandFolders = fs.readdirSync('./commands');

		for (const folder of commandFolders) {
			const commandsPath = path.join(`./commands/${folder}/`);
			const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
			for (const file of commandFiles) {
				const filePath = `../commands/${folder}/${file}`;
				const command = require(filePath);
				if(!command) continue;

				if(command.name) {
					command.category = folder;
					client.commands.set(command.name, command);
					amount++;
				} else {
					console.log(`[WARNING] The command at ${filePath} is missing a name property.`.yellow);
					continue;
				}
				if(command.aliases && Array.isArray(command.aliases)) {
					command.aliases.forEach((alias) => {
						client.aliases.set(alias, command.name);
					});
				}
			}
		}
		console.log(`[INFO] Loaded ${amount} commands`.blue);
	} catch (e) {
		console.error(`${e.message}`.red);
	}
};