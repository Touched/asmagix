#!/usr/bin/env node

'use strict';
var Liftoff = require('liftoff');
var argv = require('minimist')(process.argv.slice(2));
var chalk = require('chalk');
var core = require('../lib');
var config = require('../package.json');
var path = require('path');

var asmagix = new Liftoff({
    name: 'asmagix',
    extensions: {
        '.json': null
    }
});

// Determine task name
var task;
var rom = null;
if (argv._.length > 2) {
    if (argv._.length === 0) {
        task = 'build';
    } else {
        help();
        process.exit(1);
    }
} else {
    task = argv._[0];
    if (argv._.length == 2) {
        rom = argv._[1];
    }
}

asmagix.launch({
    cwd: argv.cwd,
    configPath: argv.asmagixfile
}, invoke);

function invoke(env) {
    if (argv.h || argv.help) {
        help();
        process.exit(0);
    }

    if (argv.v || argv.version) {
        version();
        process.exit(0);
    }

    if (!env.configPath) {
        core.log(chalk.red('No asmagixfile found'));
        process.exit(1);
    }

    var asmagixfile = require(env.configPath);
    var romPath, romName = null;

    if (asmagixfile.roms.constructor === Object) {
        if (rom) {
            romPath = asmagixfile.roms[rom];
            romName = rom;
        } else {
            var def = asmagixfile['default'];
            if (!def) {
                core.log(chalk.red('No default rom selected.'));
                process.exit(1);
            }
            romName = def;
            romPath = asmagixfile.roms[def];
        }
    }

    if (romPath) {
        romPath = path.resolve(env.cwd, romPath);
    } else {
        core.log(chalk.red('Invalid ROM specified ' + rom));
        process.exit(1);
    }

    switch (task) {
        case 'dist':
            // Create patches
            break;
        case 'build':
            // Build once
            core.build(asmagixfile, romName, romPath, env.cwd);
            break;
        case 'dev':
            // Watch for changes and build
            core.watch(asmagixfile, romName, romPath, env.cwd);
            break;
        case 'run':
            // Run the emulator
            break;
        case 'init':
            core.init(env.cwd);
            break;
        default:
            // Bad task name
            help();
            process.exit(1);
    }
}

function help() {
    console.log('help');
}

function version() {
    console.log(config.name, 'version', config.version);
}