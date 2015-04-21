'use strict';
var globule = require('globule');
var util = require('./util');
var fs = require('fs');
var path = require('path');
var log = require('./log');
var actions = require('./actions');
var toolchain = require('./toolchain');
var chalk = require('chalk');

function applyActions(rom, commands, table, file, callback) {
    var action = 'insert';
    var parameters = [];
    if (commands.action) {
        action = commands.action[0];
        parameters = commands.action.slice(1);
    }

    if (action in actions) {
        actions[action](rom, file, table, parameters, callback);
    } else {
        log(chalk.red('Invalid action: ' + action));
        process.exit(1);
    }
}

function processFile(file, name, rom, callback) {
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

    // This has high priority and will cause the entire file to be ignored
    if (commands.ignore) {
        callback();
        return;
    }

    var extraArgs = [];
    if (name) {
        extraArgs = ['-defsym', name.toUpperCase() + '=1'];
    }

    log(chalk.blue('Processing ' + file + '...'));
    toolchain.assemble(file, extraArgs, function (code, outfile) {
        if (code === 0) {
            toolchain.namelist(outfile, function (table) {
                applyActions(rom, commands, table, outfile, function () {
                    // Remove temp file before continuing
                    fs.unlink(outfile);
                    callback();
                });
            });
        } else {
            log(chalk.red('Failed to assemble ' + file));
        }
    });
}

function copyFile(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", done);

    var wr = fs.createWriteStream(target);
    wr.on("error", done);
    wr.on("close", function (ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}

module.exports = function (config, name, rom, base) {
    var files = globule.find({
        src: util.srcGlob(config),
        srcBase: base
    });

    // Copy file
    function processOne(files, rom) {
        if (files.length) {
            // Take one file
            var file = files.shift();

            processFile(path.resolve(base, file), name, rom, function () {
                // Recurse with remaining files
                processOne(files, rom);
            });
        } else {
            // End off
            // callback();
        }
    }

    var destination = path.join(base, 'test.gba');

    copyFile(rom, destination, function (err) {
        if (err) {
            log(chalk.red(err));
            process.exit(1);
        }
        processOne(files, destination);
    });
};