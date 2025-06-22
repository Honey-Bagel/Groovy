const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AutoresumeSchema = new Schema({
	_id: {
		type: String,
		required: true
	},
	voiceChannel: {
		type: String,
		required: true
	},
	textChannel: {
		type: String,
		required: true
	},
	songs: {
		type: Array,
		required: false
	},
	volume: {
		type: Number,
		required: true
	},
	repeatMode: {
		type: Number,
		required: true
	},
	playing: {
		type: Boolean,
		required: true
	},
	currentTime: {
		type: Number,
		required: true
	},
	filters: {
		type: Array,
		required: false
	},
	autoplay: {
		type: Boolean,
		required: true
	}
});

module.exports = mongoose.model("Autoresume", AutoresumeSchema);