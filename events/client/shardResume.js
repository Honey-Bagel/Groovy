const { Events } = require('discord.js');

module.exports = {
	name: Events.ShardResume,
	execute(id, replayedEvents) {
		console.log(`|| <==> || [${String(new Date).split(" ", 5).join(" ")}] || <==> || Shard #${id} Resumed || <==> ||`.brightYellow);
	}
};