'use strict';
var toolchain = require('./toolchain');
var freeSpace = require('./freeSpace');

function hook(rom, file, args, callback) {
    toolchain.objcopy(file, function (binary) {
        var loc = freeSpace(rom, binary.length);
        callback();
    });
}

function insert(rom, file, args, callback) {
    callback();
}

module.exports = {
    hook: hook,
    insert: insert
};