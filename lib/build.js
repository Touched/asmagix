'use strict';
var globule = require('globule');
var util = require('./util');
var fs = require('fs');
var path = require('path');

function assemble(file) {
    // as -> objcopy -> return binary
}

function process(file, rom) {
    // Read file and process comments
    var data = fs.readFileSync(file, 'utf-8');
    var lines = data.split('\n');

    var commands = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i].trim();

        // Ignore empty lines
        if (line === '') {
            continue;
        }

        // Process header comments
        if (line.charAt(0) === '@') {
            commands.push(line.slice(1).trim());
        } else {
            // Reached the end of heading comments
            break;
        }
    }

    console.log(commands);

    // var buf = assemble(file);
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