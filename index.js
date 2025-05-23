const Discord = require("discord.js");
const config = require("./configs/config.json");
const settings = require("./configs/settings.json");
const filters = require("./configs/filters.json");
//const mongoose = require("mongoose");
const DisTube = require("distube").default;
const { GatewayIntentBits, Partials } = require("discord.js");
//const Setting = require("./models/Settings.js");
const fs = require("fs");
const colors = require("colors");

require('dotenv').config();

// Distube Plugins
const { SpotifyPlugin } = require("@distube/spotify");
const { YouTubePlugin } = require("@distube/youtube");
const { DirectLinkPlugin } = require("@distube/direct-link");

// Create discord bot client
const client = new Discord.Client({
	fetchAllMembers: false,
	shards: "auto",
	allowedMentions: {
		parse: [],
		repliedUser: false,
	},
	failIfNotExists: false,
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
	],
	presence: {},
});

// Spotify Options
let spotifyOptions = {

};

if(config.spotify_api.enabled) {
	spotifyOptions.api = {
		clientId: process.env.SPOTIFY_CLIENTID,
		clientSecret: process.env.SPOTIFY_CLIENTSECRET,
	};
}

// Initialize distube client

client.distube = new DisTube(client, {
	emitNewSongOnly: true,
	savePreviousSongs: true,
	emitAddSongWhenCreatingQueue: false,
	nsfw: true, // Set to false to disable NSFW songs
	customFilters: filters,
	plugins: [
		new SpotifyPlugin(spotifyOptions),
		new YouTubePlugin(), // prolly need to add cookie
		new DirectLinkPlugin(),
	],
});

client.commands = new Discord.Collection();
client.dmCommands = new Discord.Collection();
client.cooldowns = new Discord.Collection();
client.slashCommands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.dmAliases = new Discord.Collection();
client.categories = fs.readdirSync("./commands/");
client.allEmojis = require("./configs/emojis.json");
client.maps = new Map();

client.setMaxListeners(100);
require('events').defaultMaxListeners = 100;

["eventHandler", "commandHandler", "slashCommandHandler", settings.antiCrash ? "antiCrash" : null, "distubeEvents", "dbHandler"]
	.filter(Boolean)
	.forEach(handler => {
		require(`./handlers/${handler}`)(client);
	});

client.login(process.env.TOKEN);