'use strict';
var globule = require('globule');
var util = require('./util');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var tmp = require('tmp');

function assemble(file, callback) {
    var name = tmp.tmpNameSync();
    var proc = spawn('arm-none-eabi-as', [file, '-o', name]);

    proc.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    proc.stderr.on('data', function (data) {
        console.log(data.toString());
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

function applyActions(rom, commands, table, file, callback) {
    console.log(rom, commands, table, file);
    callback();
}

function process(file, rom, callback) {
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
                // TODO: Warning
            }

            commands[parts[0]] = parts.slice(1);
        } else {
            // Reached the end of heading comments
            break;
        }
    }

    assemble(file, function (code, file) {
        if (code === 0) {
            namelist(file, function (table) {
                applyActions(rom, commands, table, file, callback);
            });
        } else {
            // TODO: Error
        }
    });
}

module.exports = function (config, rom, base) {
    var files = globule.find({
        src: util.srcGlob(config),
        srcBase: base
    });

    (function processOne(files) {
        // Take one file
        var file = files.shift();

        if (files.length) {
            process(path.resolve(base, file), rom, function () {
                // Recurse with remaining files
                processOne(files);
            });
        } else {
            // End off
            // callback();
        }
    })(files);
};