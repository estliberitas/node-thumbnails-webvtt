'use strict'

var path = require('path')
  , util = require('util')
  , Writer = require('../writer')




/**
 * Plain writer writes info about thumbnails to WebVTT
 * without creating spritesheet.
 *
 * @constructor
 * @extends {Writer}
 */
function PlainWriter(metadata, options, filenames) {
  Writer.call(this, metadata, options, filenames)

  var assetsDirectory = options.assetsDirectory
    , paths = []
    , thumbnail
    , i = 0
    , thumbnailPath

  while (thumbnail = filenames[i++]) {
    thumbnailPath = util.format('/%s/%s', assetsDirectory.replace(path.sep, '/'), thumbnail)

    paths.push(thumbnailPath)
  }

  this._writeInfo(paths)
}
util.inherits(PlainWriter, Writer)




module.exports = PlainWriter