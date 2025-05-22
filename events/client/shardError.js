const { Events } = require('discord.js');

module.exports = {
	name: Events.ShardError,
	execute(error, id) {
		console.log(`|| <==> || [${String(new Date).split(" ", 5).join(" ")}] || <==> || Shard #${id} Errored || <==> ||`.brightRed);
	}
};