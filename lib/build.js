'use strict';
var globule = require('globule');
var util = require('./util');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var tmp = require('tmp');
var log = require('./log');
var chalk = require('chalk');

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

function applyActions(rom, commands, table, file, callback) {
    objcopy(file, function (binary) {
        console.log(rom, commands, table, binary);
        callback();
    });
}

function process(file, name, rom, callback) {
    // Read file and process comments
    var data = fs.readFileSync(file, 'utf-8');
    var lines = data.split('\n');

    var commands = {};
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i].trim();

        // Ignore empty lines
        if (line === '') {
            continue;
        }

        // Process header comments
        // Use a dictionary - if the command is already present it is overwritten
        if (line.slice(0, 2) === '@@') {
            var parts = line.slice(2).trim().split(/\s/);

            if (parts[0] in commands) {
                log(chalk.magenta('Command "' + parts[0] + '" declared twice in ' + file));
            }

            commands[parts[0]] = parts.slice(1);
        } else {
            // Reached the end of heading comments
            break;
        }
    }

    assemble(file, function (code, outfile) {
        if (code === 0) {
            namelist(outfile, function (table) {
                applyActions(rom, commands, table, outfile, callback);
            });
        } else {
            log(chalk.red('Failed to assemble ' + file));
        }
    });
}

module.exports = function (config, name, rom, base) {
    var files = globule.find({
        src: util.srcGlob(config),
        srcBase: base
    });

    // Copy file
    (function processOne(files) {
        if (files.length) {
            // Take one file
            var file = files.shift();

            process(path.resolve(base, file), name, rom, function () {
                // Recurse with remaining files
                processOne(files);
            });
        } else {
            // End off
            // callback();
        }
    })(files);
};