'use strict';
var toolchain = require('./toolchain');
var freeSpace = require('./freeSpace');
var fs = require('fs');

function insertInFreeSpace(rom, file, extraArgs, callback) {
    if (!callback) {
        callback = extraArgs;
        extraArgs = [];
    }

    toolchain.objcopy(file, extraArgs, function (binary) {
        var loc = freeSpace(rom, binary.length);

        // Write binary at loc
        var fd = fs.openSync(rom, 'r+');
        fs.writeSync(fd, binary, 0, binary.length, loc);
        fs.closeSync(fd);

        callback(loc);
    });
}

function hook(rom, file, args, callback) {
    insertInFreeSpace(rom, file, callback);
}

function insert(rom, file, args, callback) {
    insertInFreeSpace(rom, file, function(where) {
        console.log(where);
        callback();
    });
}

module.exports = {
    hook: hook,
    insert: insert
};