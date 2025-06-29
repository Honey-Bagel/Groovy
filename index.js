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
const MusicHandler = require("./handlers/musicHandler.js");

require('dotenv').config();

// Distube Plugins
const { SpotifyPlugin } = require("@distube/spotify");
const { YouTubePlugin } = require("@distube/youtube");
const { DirectLinkPlugin } = require("@distube/direct-link");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { AppleMusicPlugin } = require("distube-apple-music");

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
		clientSecret: process.env.SPOTIFY_SECRET,
	};
}

// Initialize distube client
client.distube = new DisTube(client, {
	emitNewSongOnly: false,
	savePreviousSongs: true,
	emitAddSongWhenCreatingQueue: false,
	nsfw: true, // Set to false to disable NSFW songs
	customFilters: filters,
	plugins: [
		new SpotifyPlugin(spotifyOptions),
		new YouTubePlugin({ cookies: JSON.parse(process.env.YT_COOKIES) }), // prolly need to add cookie
		new DirectLinkPlugin(),
		new AppleMusicPlugin(),
		new YtDlpPlugin({
			update: true,
		})
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
client.PlayerMap = new Map();
client.playerintervals = new Map();

client.setMaxListeners(100);
require('events').defaultMaxListeners = 100;

client.distube.setMaxListeners(100);

require("./handlers/eventHandler")(client);

client.on("ready", () => {
	["commandHandler", "slashCommandHandler", settings.antiCrash ? "antiCrash" : null, "distubeEvents", "dbHandler", "autoresume"]
		.filter(Boolean)
		.forEach(handler => {
			require(`./handlers/${handler}`)(client);
		});

	const musicHandler = new MusicHandler();
	musicHandler.initialize(client, client.distube);
});

client.login(process.env.TOKEN);