const mongoose = require('mongoose');

module.exports = (client) => {
	try {
		mongoose.connect(process.env.MONGO_URI)
			.then(async () => {
				console.log(`[INFO] Connected to MongoDB`.green);
			});
	} catch(err) {
		console.error(`[ERROR] Failed to connect to MongoDB: ${err.message}`.red);
	}
};