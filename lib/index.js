'use strict'

var path = require('path')
  , PlainWriter = require('./writer/plain')
  , SpriteSheetWriter = require('./writer/spritesheet')
  , utils = require('./utils')




/**
 * Main GodLike callback
 *
 * @callback thumbgenCallback
 * @param {Error} err Any error
 * @param {object} metadata Metadata
 */

/**
 * Generate thumbnails and pack them into WebVTT file
 *
 * @param {string} source Video file
 * @param {object} options Various options
 * @param {thumbgenCallback} callback Accepts arguments: (err, metadata)
 */
module.exports = function(source, options, callback) {
  if (!source) {
    return callback(new Error('Source video file is not specified'))
  }
  else if (!options.numThumbnails && !options.secondsPerThumbnail && !options.framesPerThumbnail && !options.timemarks) {
    return callback(new Error('You should specify the way timemarks are calculated'))
  }

  var sourceExt = path.extname(source)
    , sourceBase = path.basename(source, sourceExt)
    , outputDir
    , metadata

  if (!options.output) {
    options.output = path.join(path.dirname(source), sourceBase + '.vtt')
  }

  outputDir = path.dirname(options.output)

  if (!options.assetsDirectory) {
    options.assetsDirectory = sourceBase
  }

  options.thumbnailsDirectory = path.join(outputDir, options.assetsDirectory)

  utils.metadata(source, onmetadata)

  function onmetadata(err, data) {
    if (err) {
      return callback(err)
    }

    metadata = data

    if (!options.timemarks) {
      options.timemarks = []
    }
    options.bounds = []

    var mark
      , i = 0

    if (options.timemarks.length) {
      i = 0
      while (mark = options.timemarks[i++]) {
        options.bounds.push(mark)
      }
    }
    else if (options.numThumbnails) {
      var diff = metadata.duration * 0.9 / options.numThumbnails
      i = 0

      while (i < options.numThumbnails) {
        options.bounds.push(Number(i*diff).toFixed(3))
        options.timemarks.push(Number(i * diff + diff / 2).toFixed(3))
        i++
      }
    }
    else if (options.secondsPerThumbnail) {
      mark = 0

      while (mark < metadata.duration) {
        options.bounds.push(Number(mark).toFixed(3))
        options.timemarks.push(Number(mark).toFixed(3))

        mark += options.secondsPerThumbnail
      }
    }
    else if (options.framesPerThumbnail) {
      mark = 0

      while (mark < metadata.duration) {
        options.bounds.push(Number(mark).toFixed(3))
        options.timemarks.push(Number(mark).toFixed(3))

        if (!metadata.fps) {
          return callback(new Error('Can\'t determine video FPS.'))
        }

        mark += options.framesPerThumbnail / metadata.fps
      }
    }

    if (!options.size) {
      options.size = {
        width:  metadata.width,
        height: metadata.height
      }
    }
    else if (!options.size.height) {
      options.size.height = options.size.width * metadata.height / metadata.width
    }
    else if (!options.size.width) {
      options.size.width = options.size.height * metadata.width / metadata.height
    }

    utils.generateThumbnails(source, {
      directory: options.thumbnailsDirectory,
      size:      options.size,
      timemarks: options.timemarks
    }, ongenerate)
  }

  function ongenerate(err, filenames) {
    if (err) {
      return callback(err)
    }

    var writer
    if (options.spritesheet) {
      writer = new SpriteSheetWriter(metadata, options, filenames)
    }
    else {
      writer = new PlainWriter(metadata, options, filenames)
    }

    writer.on('error', onerror)
    writer.on('success', onsuccess)
  }

  function onerror(err) {
    callback(err)
  }

  function onsuccess(data) {
    callback(null, {
      thumbnailsData: data
    })
  }
}