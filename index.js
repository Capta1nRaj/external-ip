'use strict';
var extIP = require('./lib/extIP');
var utils = require('./lib/utils');

module.exports = function (extConf) {
    extConf = extConf || {};

    var extValid = utils.validateConfig(extConf);

    if (extValid.errors.length) {
        throw new Error(extConf.errors);
    }

    // Check: https://github.com/mjhasbach/MOIRA
    var defConf = {
        replace: false,
        services: [
            'http://ifconfig.co/x-real-ip',
            'http://ifconfig.me/ip',
            'http://icanhazip.com/',
            'http://ip.appspot.com/',
            'http://curlmyip.com/',
            'http://ident.me/',
            'http://whatismyip.akamai.com/',
            'http://tnx.nl/ip',
            'http://myip.dnsomatic.com/',
            'http://ipecho.net/plain'
        ],
        timeout: 500
    };

    var config = utils.mergeConfig(extConf, defConf);

    var services = extIP.setup(config).services;



    var getIP = function (cb) {
        var errors = [];
        utils.asyncLoop({
            iterations: services.length,
            exec: function (i, stop, next) {
                services[i].getIP(function (err, ip) {
                    if (err) {
                        err = services[i].url + ' : ' + err;
                        errors.push(err);
                        next();
                    } else {
                        stop(ip);
                    }
                });
            },
            done: function (ip) {
                cb.apply(null, ip ? [null, ip] : [errors, null]);
            }
        });
    };

    return getIP;
};