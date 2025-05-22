const { Events } = require('discord.js');

module.exports = {
	name: Events.ShardDisconnect,
	execute(client, event, id) {
		console.log(` || <==> || [${String(new Date).split(" ", 5).join(" ")}] || <==> || Shard #${id} Disconnected || <==> ||`.brightYellow);
	}
};