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

module.exports = function (directory) {
    fs.stat(directory, function (err, stats) {
        if (stats.isDirectory()) {
            // Create directories
            var directories = ['roms', 'src', 'build'];

            directories.forEach(function (subdirectory) {
                createDirectory(directory, subdirectory);
            });

            var config = {
                src: './src',
                roms: {
                    'default': './roms/bpre.gba',
                    bpre: './roms/bpre.gba'
                },
                build: './build'
            };

            fs.writeFile(path.join(directory, 'asmagixfile.json'), JSON.stringify(config, null, 2), function (err) {
                if(err) {
                    console.log(err);
                }
            });
        }
    });
};