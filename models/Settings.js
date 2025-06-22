const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SettingsSchema = new Schema({
	_id: {
		type: String,
		required: true,
	},
	prefix: {
		type: String,
		default: "-",
		required: true
	},
	guildName: {
		type: String,
		default: "Guild Name",
		required: true
	},
	defaultVolume: {
		type: String,
		default: 100,
		required: true,
	},
	maxVolume: {
		type: String,
		default: 200,
		required: true,
	},
	autoresume: {
		type: Boolean,
		default: true,
		required: true,
	},
	defaultautoplay: {
		type: Boolean,
		default: false,
		required: true,
	},
	defaultfilters: {
		type: Array,
		default: [],
		required: true,
	},
	playlists: {
		type: Array,
		default: [],
		required: true,
	},
	botChannel: {
		type: String,
		required: false,
	},
	firstMessage: {
		type: Boolean,
		default: true,
		required: true
 	 },
	deleteUserMessages: {
		type: Boolean,
		default: true,
		required: true
	},
	deleteBotMessages: {
		type: Boolean,
		default: true,
		required: true
	},
	deleteAfter: {
		type: Number,
		default: 5000,
		required: true
	}
});

module.exports = mongoose.model("Setting", SettingsSchema);