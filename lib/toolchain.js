'use strict';
var log = require('./log');
var spawn = require('child_process').spawn;
var tmp = require('tmp');
var fs = require('fs');

function objcopy(file, args, callback) {
    if (!args) {
        args = [];
    }

    if (!callback) {
        callback = args;
        args = [];
    }

    var out = tmp.tmpNameSync();
    var defaultArgs = ['-O', 'binary', file, out];
    var proc = spawn('arm-none-eabi-objcopy', args.concat(defaultArgs));

    proc.on('exit', function (code) {
        if (code) {
            log(chalk.red('Objcopy failed'));
        } else {
            var binary = fs.readFileSync(out);
            fs.unlinkSync(out);
            callback(binary);
        }
    })
}

module.exports = {
    objcopy: objcopy
};