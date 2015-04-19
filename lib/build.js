'use strict';
var path = require('path');
var globule = require('globule');

module.exports = function (config, rom, base) {
    var pattern = [path.join(config.src, '*.asm'), path.join(config.src, '*.s')];

    var files = globule.find({
        src: pattern,
        srcBase: base
    });

    console.log(files);
};