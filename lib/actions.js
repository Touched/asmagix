'use strict';

var toolchain = require('./toolchain');

function hook(rom, file, args, callback) {
    toolchain.objcopy(file, function (binary) {
        callback();
    });
}

function insert() {

}

module.exports = {
    hook: hook,
    insert: insert
};