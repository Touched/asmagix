var chalk = require('chalk');
var util = require('util');

// Gulp style logging
module.exports = function () {
    var timestamp = new Date();
    var time = '[' + chalk.grey(timestamp) + ']';
    process.stdout.write(time + ' ');
    console.log.apply(console, arguments);
    return this;
};