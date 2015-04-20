'use strict';
var globule = require('globule');
var util = require('./util');
var fs = require('fs');
var path = require('path');

function assemble(file) {
    // as -> return filename
}

function process(file, rom) {
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

    console.log(commands);

    // var buf = assemble(file);
    // var names = namelist(file); // use nm
    // do stuff with buffer
}

module.exports = function (config, rom, base) {
    var files = globule.find({
        src: util.srcGlob(config),
        srcBase: base
    });

    files.forEach(function (file) {
        process(path.resolve(base, file), rom);
    });
};