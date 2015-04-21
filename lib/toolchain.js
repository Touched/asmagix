'use strict';
var log = require('./log');
var spawn = require('child_process').spawn;
var tmp = require('tmp');
var fs = require('fs');


function assemble(file, args, callback) {
    if (!args) {
        args = [];
    }

    if (!callback) {
        callback = args;
        args = [];
    }

    var name = tmp.tmpNameSync();
    var defaultArgs = [file, '-o', name];
    var proc = spawn('arm-none-eabi-as', args.concat(defaultArgs));

    proc.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    proc.stderr.on('data', function (data) {
        log(chalk.red(data.toString()));
    });

    proc.on('exit', function (code) {
        callback(code, name);
    });
}

function namelist(file, callback) {
    var proc = spawn('arm-none-eabi-nm', [file]);

    var table = '';

    proc.stdout.on('data', function (data) {
        table += data.toString();
    });

    proc.on('exit', function (code) {
        table = table.split('\n');

        // Reorganise in hash table
        // Allows applyActions to resolve symbol names if necessary
        var output = {};
        table.forEach(function (entry) {
            // Skip empty lines
            if (entry) {
                var parts = entry.split(/\s+/);

                // Parse
                var value = parseInt(parts[0], 16),
                    type = parts[1],
                    name = parts[2];

                // Only symbols declared with .equ or similar are read
                if (type === 'a') {
                    output[name] = value;
                }
            }
        });

        callback(output);
    });
}

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
    objcopy: objcopy,
    namelist: namelist,
    assemble: assemble
};