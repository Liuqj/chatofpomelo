var net = require("net");
var log4js = require("log4js");
log4js.configure({
    appenders: [
        { type: 'console' }, //控制台输出
        {
            type: 'file', //文件输出
            filename: 'logs/info-crossdomain.log',
            maxLogSize: 1048576,
            backups: 5,
            category: 'normal'
        }
    ],
    "replaceConsole": true
});
var logger = log4js.getLogger('normal');

var domains = ["*:*"]; // domain:port list

var netserver = net.createServer(function(socket){
    socket.addListener("error",function(err){
        socket.end && socket.end() || socket.destroy && socket.destroy();
    });
    var xml = '<?xml version="1.0"?>\n<!DOCTYPE cross-domain-policy SYSTEM \n"http://www.adobe.com/xml/dtds/cross-domain-policy.dtd">\n<cross-domain-policy>\n';
    xml += '<allow-access-from domain="*" to-ports="*"/>\n';
    xml += '</cross-domain-policy>\n';
    if(socket && socket.readyState == 'open'){
        socket.write(xml);
        socket.end();
    }
});
netserver.addListener("error", function(err){logger.info(err)});
netserver.listen(3843);

logger.info("Flash policy server has started. Please see on http://127.0.0.1:3843/");
