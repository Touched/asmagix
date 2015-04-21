'use strict';
var fs = require('fs');

var cachedData = null,
    cachedPath = null,
    cachedBlock = null;

var offsetSize = 100;

function wordAlign(word) {
    return word & 0xFFFFFFFC
}

function cacheSpace(rom) {
    var foundSize = 0, foundAt = -1, maxSizeFound = 0, maxSizeFoundAt;
    for (var i = 0; i < cachedData.length; ++i) {
        // Loop through all the data checking for free space bytes
        if (cachedData[i] === 0xFF) {
            // We haven't found a block yet, so record where it started
            if (foundAt < 0) {
                foundAt = i;
            }

            // Track the block sizes
            foundSize++;
        } else {
            // We've found a larger block, so record where it is
            if (foundSize > maxSizeFound) {
                maxSizeFound = foundSize;
                maxSizeFoundAt = foundAt;
            }

            // Reset - this block has ended
            foundSize = 0;
            foundAt = -1;
        }
    }

    if (maxSizeFound < offsetSize * 2) {
        throw new Error('Not enough free space');
    }

    cachedBlock = {
        end: wordAlign(maxSizeFoundAt + maxSizeFound - 1),
        beg: wordAlign(maxSizeFoundAt + offsetSize)
    };
}

module.exports = function (rom, size) {
    // Cache the path so we don't read this multiple times
    if (cachedPath !== rom) {
        cachedData = fs.readFileSync(rom);

        // Record the biggest block's location so we can just search through that later
        cacheSpace(rom);
    }

    console.log(cachedBlock);
};