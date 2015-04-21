'use strict';
var toolchain = require('./toolchain');
var freeSpace = require('./freeSpace');
var log = require('./log');
var fs = require('fs');
var chalk = require('chalk');

function offsetString(offset) {
    var hex = offset.toString(16);

    // Zero pad
    while (hex.length < 6) {
        hex = '0' + hex;
    }

    return '0x' + hex;
}

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

        log('Inserted at ' +  offsetString(loc));

        callback(loc);
    });
}

function offsetToAddressBuffer(offset) {
    var buf = new Buffer(4);
    buf.writeUInt32LE(offset + 0x08000000, 0);
    return buf;
}

function getValue(what, table) {
    // Assume int
    var out = parseInt(what);
    if (isNaN(out)) {
        // Look in symbol table
        if (what in table) {
            out = table[what];
        } else {
            log(chalk.red('Unknown value ' + out));
            process.exit(0);
        }
    }
    return out;
}

function hook(rom, file, table, args, callback) {
    var hookLoc = getValue(args[0], table),
        register = 0,
        thumb = true;

    if (args.length === 2) {
        register = getValue(args[1], table);
    }

    if (args.length === 3) {
        thumb = args[2] === 'thumb';
        if (!thumb && args[2] !== 'arm') {
            log(chalk.red('Bad hook parameter: ' + args[2]));
            process.exit(0);
        }
    }

    insertInFreeSpace(rom, file, function (where) {
        // Half-word align
        hookLoc = (hookLoc & 1) ? hookLoc - 1 : hookLoc;

        var literal = offsetToAddressBuffer(where);

        // Make sure it loads the correct literal depending on where we hook
        var hookData;
        if (hookLoc % 4) {
            hookData = new Buffer([0x01, 0x48 | register, 0x00 | (register << 3), 0x47, 0x0, 0x0]);
        } else {
            hookData = new Buffer([0x00, 0x48 | register, 0x00 | (register << 3), 0x47]);
        }

        // Add the literal pool and write to ROM
        hookData = Buffer.concat([hookData, literal]);
        writeInRom(rom, hookData, hookLoc);

        log('Overwrote ' + hookData.length + ' bytes at ' + offsetString(hookLoc));

        callback();
    });
}

function insert(rom, file, table, args, callback) {
    insertInFreeSpace(rom, file, callback);
}

module.exports = {
    hook: hook,
    insert: insert
};