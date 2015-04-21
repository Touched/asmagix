'use strict';
var toolchain = require('./toolchain');
var freeSpace = require('./freeSpace');

function insertInFreeSpace(rom, file, extraArgs, callback) {
    if (!callback) {
        callback = extraArgs;
        extraArgs = [];
    }

    toolchain.objcopy(file, extraArgs, function (binary) {
        var loc = freeSpace(rom, binary.length);
        callback();
    });
}

function hook(rom, file, args, callback) {
    insertInFreeSpace(rom, file, callback);
}

function insert(rom, file, args, callback) {
    callback();
}

module.exports = {
    hook: hook,
    insert: insert
};