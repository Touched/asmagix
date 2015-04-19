'use strict';
var path = require('path');

module.exports = {
  srcGlob: function(config) {
      return [path.join(config.src, '*.asm'), path.join(config.src, '*.s')];
  }
};