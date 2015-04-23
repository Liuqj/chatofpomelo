var logger = require('pomelo-logger').getLogger('info-log', __filename);

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
		this.app = app;
};

var handler = Handler.prototype;

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
	var self = this;
	var rid = msg.rid;
	var uid = msg.username + '*' + rid
	var sessionService = self.app.get('sessionService');

	//duplicate log in
	if( !! sessionService.getByUid(uid)) {
		logger.warn('enter: msg[kick start] uid[%s]', uid);
	//	next(null, {
	//		code: 500,
	//		error: true,
        //    message:'用户已登陆'
	//	});
	//	return;
		sessionService.kick(uid, onSessionKick.bind(null, uid));
	}

	session.bind(uid);
	session.set('rid', rid);
	session.push('rid', onSessionPush.bind(null, uid));
	session.on('closed', onUserLeave.bind(null, self.app));

	//put user into channel
	logger.info('enter: msg[add user into channel] uid[%s]', uid);
	self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), rid, true, function(users){
		next(null, {
			users:users
		});
	});
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
	if(!session || !session.uid) {
		logger.warn('leave: msg[close session fail]');
		return;
	}

	logger.info('leave: msg[close session ok] uid[%s]', session.uid);
	app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};

var onSessionKick = function(uid) {
	logger.warn('enter: msg[kick over] uid[%s]', uid);
}

var onSessionPush = function(uid, err) {
	if(err) {
		logger.error('enter: msg[push session fail] uid[%s] error[%j]', uid, err.stack);
	}
	else {
		logger.info('enter: msg[push session ok] uid[%s]', uid);
	}
}
