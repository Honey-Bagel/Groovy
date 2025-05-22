const fs = require('fs');
const path = require("path");

module.exports = async (client) => {
	try {
		let amount = 0;
		const load_dir = (dir) => {
			const event_files = fs.readdirSync(`./events/${dir}`).filter((file) => file.endsWith(".js"));
			for(const file of event_files) {
				const event = require(`../events/${dir}/${file}`);
				if(event.name === 'rateLimited') {
					client.on(event.name, (...args) => null);
					continue;
				} else if(event.once) {
					client.once(event.name, (...args) => event.execute(...args, client));
				} else {
					client.on(event.name, (...args) => event.execute(...args, client));
				}
				amount++;
			}
		};

		await ["client", "guild"].forEach(e => load_dir(e));
		console.log(`Loaded ${amount} events`.yellow);
	} catch (error) {
		console.error(`Error loading events: ${error.message}`.red);
	}
};