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

    }
} else {
    task = argv._[0];
}

asmagix.launch({
    cwd: argv.cwd,
    configPath: argv.asmagixfile
}, invoke);

function invoke(env) {
    console.log()
}