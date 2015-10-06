var path = require('path'),
       _ = require('lodash'),
    root = __dirname;

var baseConfig = {
    env: process.env.NODE_ENV,
    root: root,
    debug: true,
};

var envConfig = {
    development: {
        port: 3000
    }, 
    production: {
         port: process.env.PORT || 88
    },
};

// override the base configuration with the platform specific values
module.exports = _.merge(baseConfig, envConfig[baseConfig.env || (baseConfig.env = 'development')]);
