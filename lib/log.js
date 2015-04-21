var chalk = require('chalk');
var util = require('util');

function timestamp() {
    var date = new Date();

    function pad(value) {
        var out = value.toString();
        if (out.length < 2) {
            return '0' + out;
        }
        return out;
    }

    return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
}

// Gulp style logging
module.exports = function () {
    var time = '[' + chalk.grey(timestamp()) + ']';
    process.stdout.write(time + ' ');
    console.log.apply(console, arguments);
    return this;
};