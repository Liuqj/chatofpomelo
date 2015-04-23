var dispatcher = require('../../../util/dispatcher');
var logger = require('pomelo-logger').getLogger('info-log', __filename);

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Gate handler that dispatch user to connectors.
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next stemp callback
 *
 */

handler.queryEntry = function(msg, session, next) {
	var uid = msg.uid;
	if(!uid) {
		logger.warn('queryEntry: msg[bad uid] uid[%s]', uid);
		next(null, {
			code: 500,
            message: '请先登陆再连接'
		});
		return;
	}
	// get all connectors
	var connectors = this.app.getServersByType('connector');
	if(!connectors || connectors.length === 0) {
		logger.warn('queryEntry: msg[get all connectors fail] uid[%s]', uid);
		next(null, {
			code: 500
		});
		return;
	}
	// select connector
	var res = dispatcher.dispatch(uid, connectors);
	logger.info('queryEntry: msg[select connector] uid[%s] host[%s] clientport[%s]', uid, res.host, res.clientPort);
	next(null, {
		code: 200,
		host: res.host,
		port: res.clientPort
	});
};
