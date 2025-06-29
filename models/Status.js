const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const statusItemSchema = new Schema({
	type: {
		type: String,
		enum: ["playing", "watching", "listening", "competing"],
		required: true,
	},
	message: {
		type: String,
		required: true
	}
}, { _id: false });

const rotatingStatusSchema = new Schema({
	_id: { type: String, default: "botStatus" },
	statuses: [statusItemSchema],
});

module.exports = mongoose.model("RotatingStatus", rotatingStatusSchema);