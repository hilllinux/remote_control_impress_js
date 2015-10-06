var config = require('./config.js')
exports.log = function log(msg){

    if (config.debug == false) return;

    var date = new Date(); 
    console.info(date+" --> "+msg);

}
