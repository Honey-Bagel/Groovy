const { Events } = require('discord.js');
const { isVoiceChannelEmpty } = require("distube");

module.exports = {
	name: Events.VoiceStateUpdate,
	execute(oldState, newState, client) {
		if(!oldState?.channel) return;

		const voice = client.distube.voices.get(oldState);

		if(voice && isVoiceChannelEmpty(oldState)) {
			voice.leave();
		}
	}
};