const fs = require('fs');

module.exports = (client) => {
	try {
		let amount = 0;
		const event_files = fs.readdirSync('./events/distube').filter((file) => file.endsWith('.js'));
		for(const file of event_files) {
			const event = require(`../events/distube/${file}`);
			client.distube.on(event.name, (...args) => event.execute(...args, client));
			amount++;
		}

		console.log(`[INFO] Loaded ${amount} distube events`.blue);
	} catch (error) {
		console.error(`[ERROR] loading distube events: ${error.message}`.red);
	}
};