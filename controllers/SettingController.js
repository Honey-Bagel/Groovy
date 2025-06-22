const mongoose = require('mongoose');
const Setting = require('../models/Settings.js');

const getSettings = async () => {
	return await Setting.find({});
};

const getSetting = async (guildId) => {
	return await Setting.findOne({ _id: guildId });
};

const createSetting = async (newSetting) => {
	return await Setting.create(newSetting);
};

const deleteSetting = async (guildId) => {
	return await Setting.findOneAndDelete({ _id: guildId });
};

const updateSetting = async (guildId, newSetting, upsert) => {
	return await Setting.findOneAndUpdate({ _id: guildId }, newSetting, upsert);
};

module.exports = {
	getSettings,
	getSetting,
	createSetting,
	deleteSetting,
	updateSetting
};