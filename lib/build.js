'use strict';
var globule = require('globule');
var util = require('./util');

module.exports = function (config, rom, base) {
    var files = globule.find({
        src: util.srcGlob(config),
        srcBase: base
    });

    console.log(files);
};