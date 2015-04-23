var logger = require('pomelo-logger').getLogger('info-log', __filename);

module.exports = function(app) {
	return new ChatRemote(app);
};

var ChatRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

/**
 * Add user into chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
ChatRemote.prototype.add = function(uid, sid, name, flag, cb) {
	var channel = this.channelService.getChannel(name, flag);
	var username = uid.split('*')[0];
	var param = {
		route: 'onAdd',
		user: username
	};

	logger.info('add: msg[push message] uid[%s] username[%s] channelname[%s]', uid, username, name);
	channel.pushMessage(param);

	if( !! channel) {
		logger.info('add: msg[add user] uid[%s] channelname[%s] sid[%s]', uid, name, sid);
		channel.add(uid, sid);
	}

	cb(this.get(name, flag));
};

/**
 * Get user from chat channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
ChatRemote.prototype.get = function(name, flag) {
	var users = [];
	var channel = this.channelService.getChannel(name, flag);
	if( !! channel) {
		users = channel.getMembers();
	}
	for(var i = 0; i < users.length; i++) {
		users[i] = users[i].split('*')[0];
	}
	logger.info('get: msg[get user list] length[%s] channelname[%s]', users.length, name);
	return users;
};

/**
 * Kick user out chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
ChatRemote.prototype.kick = function(uid, sid, name) {
	var channel = this.channelService.getChannel(name, false);
	// leave channel
	if( !! channel) {
		logger.info('kick: msg[kick user] uid[%s] channelname[%s] sid[%s]', uid, name, sid);
		channel.leave(uid, sid);
	}
	var username = uid.split('*')[0];
	var param = {
		route: 'onLeave',
		user: username
	};

	logger.info('kick: msg[push message] uid[%s] username[%s] channelname[%s]', uid, username, name);
	channel.pushMessage(param);
};
