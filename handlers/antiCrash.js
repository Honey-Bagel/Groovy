module.exports = (client) => {
	process.on('unhandledRejection', (reason, p, origin) => {
		console.log('[antiCrash] :: Unhandled Rejection/Catch');
		console.log(reason, p);
		console.log(`Origin: ${origin}`.red);
	});
	process.on("uncaughtException", (err, origin, reason, p) => {
		console.log('[antiCrash] :: Uncaught Exception/Catch');
		console.log(`Error: ${err.stack}`.red);
		console.log(`Origin: ${origin}`.red);
		console.log(reason, p);
	});
	process.on('uncaughtExceptionMonitor', (err, origin) => {
		console.log('[antiCrash] :: Uncaught Exception/Catch (MONITOR)');
		console.log(err, origin);
	});
};