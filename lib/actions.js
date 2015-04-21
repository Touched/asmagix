'use strict';
var toolchain = require('./toolchain');
var freeSpace = require('./freeSpace');
var log = require('./log');
var fs = require('fs');

function writeInRom(rom, data, where) {
    var fd = fs.openSync(rom, 'r+');
    fs.writeSync(fd, data, 0, data.length, where);
    fs.closeSync(fd);
}

function insertInFreeSpace(rom, file, extraArgs, callback) {
    if (!callback) {
        callback = extraArgs;
        extraArgs = [];
    }

    toolchain.objcopy(file, extraArgs, function (binary) {
        var loc = freeSpace(rom, binary.length);

        // Write binary at loc
        writeInRom(rom, binary, loc);

        log('Inserted at 0x' + loc.toString(16));

        callback(loc);
    });
}

function hook(rom, file, args, callback) {
    insertInFreeSpace(rom, file, callback);
}

function insert(rom, file, args, callback) {
    insertInFreeSpace(rom, file, function(where) {
        callback();
    });
}

module.exports = {
    hook: hook,
    insert: insert
};