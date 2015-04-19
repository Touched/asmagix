#!/usr/bin/env node

'use strict';
var Liftoff = require('liftoff');
var argv = require('minimist')(process.argv.slice(2));
var chalk = require('chalk');
var core = require('../lib');

var asmagix = new Liftoff({
    name: 'asmagix',
    extensions: {
        '.json': null
    }
});

// Determine task name
var task;
if (argv._.length != 1) {
    if (argv._.length === 0) {
        task = 'build';
    } else {
        help();
        process.exit(1);
    }
} else {
    task = argv._[0];
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

    switch (task) {
        case 'build':
            // Create patches
            break;
        case 'dev':
            // Watch for changes and build
            break;
        case 'run':
            // Run the emulator
            break;
        case 'init':
            // Scaffold project
            break;
        default:
            help();
            process.exit(1);
    }
}

function help() {
    console.log('help');
}

function version() {

}