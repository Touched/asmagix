'use strict';

var fs = require('fs');
var path = require('path');

function createDirectory(directory, name) {
    var target = path.join(directory, name);
    try {
        fs.mkdirSync(target);
    } catch (e) {
        if (e.code != 'EEXIST') throw e;
    }
}

function findToolchain() {
    return {};
}

function findEmulator() {
    return '';
}
module.exports = function (directory) {
    fs.stat(directory, function (err, stats) {
        if (stats.isDirectory()) {
            // Create directories
            var directories = ['roms', 'src', 'build'];

            directories.forEach(function (subdirectory) {
                createDirectory(directory, subdirectory);
            });

            var toolchain = findToolchain();
            var emulator = findEmulator();

            var config = {
                src: './src',
                roms: './roms',
                build: './build',
                toolchain: {
                    as: toolchain.as,
                    objcopy: toolchain.objcopy
                },
                emulator: emulator
            };

            fs.writeFile(path.join(directory, 'asmagixfile.json'), JSON.stringify(config, null, 2), function (err) {
                console.log(err);
            });
        }
    });
};