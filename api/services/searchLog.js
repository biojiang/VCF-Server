var log4js = require('log4js');

log4js.configure({
    appenders: [
        {
            type: "file",
            filename: "searchLog.log",
            category: [ 'searchLog' ]
        }
    ]
});

var logger = log4js.getLogger('searchLog');
logger.setLevel('ALL');

exports.write = function(str) {
    logger.trace(str);
};

