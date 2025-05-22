const { Events } = require('discord.js');

module.exports = {
	name: Events.ThreadCreate,
	execute: async (client, thread) => {
		if(thread.joinable){
			try{
				await thread.join();
			}catch (e){
				console.log(e);
			}
		}
	}
};