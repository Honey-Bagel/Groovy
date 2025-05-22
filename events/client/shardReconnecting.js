const { Events } = require('discord.js');

module.exports = {
	name: Events.ShardReady,
	execute(id) {
		console.log(`|| <==> || [${String(new Date).split(" ", 5).join(" ")}] || <==> || Shard #${id} Reconnecting || <==> ||`.brightYellow);
	}
};