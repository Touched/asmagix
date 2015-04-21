'use strict';

var toolchain = require('./toolchain');

function hook(rom, file, args, callback) {
    toolchain.objcopy(file, function (binary) {
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