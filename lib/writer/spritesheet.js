'use strict'

var fs = require('fs-extra')
  , lodash = require('lodash')
  , path = require('path')
  , sprite = require('node-sprite')
  , util = require('util')
  , utils = require('../utils')
  , Writer = require('../writer')




/**
 * Small helper to be sure we're not getting EEXIST
 */
function unlinkAndMove(src, dst, callback) {
  fs.exists(dst, onexists)

  function onexists(exists) {
    if (!exists) {
      move(null)
    }
    else {
      fs.unlink(dst, move)
    }
  }

  function move(err) {
    if (err) {
      callback(err)
    }
    else {
      fs.move(src, dst, callback)
    }
  }
}




/**
 * Creates spritesheet then writes files
 *
 * @constructor
 * @extends {Writer}
 */
function SpriteSheetWriter(metadata, options, filenames) {
  Writer.call(this, metadata, options, filenames)
  var self = this
    , spriteOptions
    , sheetName = options.spriteSheetName || 'thumbnails'
    , spritesDirectory = path.join(options.thumbnailsDirectory, sheetName)
    , paths = []

  spriteOptions = lodash.extend({
    path: options.thumbnailsDirectory
  }, options.spriteSheetOptions || {})

  fs.exists(spritesDirectory, onexists)

  function onexists(exists) {
    if (exists) {
      onmkdir(null)
    }
    else {
      fs.mkdir(spritesDirectory, onmkdir)
    }
  }


  function onmkdir(err) {
    if (err) {
      return self.emit('internalError', err)
    }

    var tomove = filenames.length
      , error = null
      , i = 0
      , thumbnail

    while (thumbnail = filenames[i++]) {
      move(thumbnail)
    }

    function move(thumbnail) {
      var src = path.join(options.thumbnailsDirectory, thumbnail)
        , dst = path.join(spritesDirectory, thumbnail)

      unlinkAndMove(src, dst, ondone)
    }

    function ondone(err) {
      if (error) {
        return
      }
      else if (err) {
        error = err
        self.emit('internalError', err)
      }
      else if (!--tomove) {
        createSpriteSheet()
      }
    }
  }

  function createSpriteSheet() {
    sprite.sprite(sheetName, spriteOptions, function(err, globalSprite) {
      if (err) {
        return self.emit('internalError', err)
      }

      var sprites = globalSprite.images
        , sheetFilename = globalSprite.filename()
        , sheetExt = path.extname(sheetFilename)
        , filename
        , i = 0
        , spritePath

      while (filename = filenames[i++]) {
        sprite = lodash.find(sprites, {filename: filename})
        spritePath = util.format(
          '/%s/%s#xywh=%d,%d,%d,%d',
          options.assetsDirectory,
          sheetName + sheetExt,
          sprite.positionX,
          sprite.positionY,
          sprite.width,
          sprite.height
        )

        paths.push(spritePath)
      }

      renameSheetName(sheetFilename, sheetName + sheetExt)
    })
  }

  function renameSheetName(src, dst) {
    src = path.join(options.thumbnailsDirectory, src)
    dst = path.join(options.thumbnailsDirectory, dst)

    unlinkAndMove(src, dst, removeSpritesDirectory)
  }

  function removeSpritesDirectory(err) {
    if (err) {
      return self.emit('internalError', err)
    }

    fs.remove(spritesDirectory, removeSheetSpec)
  }

  function removeSheetSpec(err) {
    if (err) {
      return self.emit('internalError', err)
    }

    fs.remove(path.join(options.thumbnailsDirectory, sheetName + '.json'), writeInfo)
  }

  function writeInfo(err) {
    if (err) {
      return self.emit('internalError', err)
    }

    self._writeInfo(paths)
  }
}
util.inherits(SpriteSheetWriter, Writer)




module.exports = SpriteSheetWriter