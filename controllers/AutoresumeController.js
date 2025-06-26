const mongoose = require('mongoose');
const Autoresume = require('../models/Autoresume');

async function getAutoresumes() {
	return await Autoresume.find({});
}

async function getAutoresume(guildId) {
	return await Autoresume.findOne({ _id: guildId });
}

async function createAutoresume(newAutoresume) {
	return await Autoresume.create(newAutoresume);
}

async function deleteAutoresume(guildId) {
	return await Autoresume.findOneAndDelete({ _id: guildId });
}

async function updateAutoresume(guildId, newAutoresume, shouldUpsert) {
	return await Autoresume.findOneAndUpdate({ _id: guildId }, newAutoresume, { upsert: shouldUpsert });
}

async function autoresumeExists(guildId) {
	return await Autoresume.exists({ _id: guildId });
}

module.exports.getAutoresumes = getAutoresumes;
module.exports.getAutoresume = getAutoresume;
module.exports.createAutoresume = createAutoresume;
module.exports.deleteAutoresume = deleteAutoresume;
module.exports.updateAutoresume = updateAutoresume;
module.exports.autoresumeExists = autoresumeExists;