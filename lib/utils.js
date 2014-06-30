'use strict'

var FFmpeg = require('fluent-ffmpeg')
  , moment = require('moment')




/**
 * generateThumbnails() callback
 *
 * @callback thumbnailsCallback
 * @param {Error} err Any kind of error
 * @param {string[]} filenames Thumbnails names
 */

/**
 * Generate thumbnails
 *
 * @param {string} source Path to video file
 * @param {object} options No comments
 * @param {thumbnailsCallback} callback Accepts arguments: (err, filenames)
 */
exports.generateThumbnails = function(source, options, callback) {
  new FFmpeg({source: source})
    .withSize(toSizeString(options.size))
    .on('error', onerror)
    .on('end', success)
    .takeScreenshots(
    {
      count:     options.timemarks.length,
      timemarks: options.timemarks
    },
    options.directory
  )

  function onerror(err) {
    callback(err)
  }

  function success(filenames) {
    callback(null, filenames)
  }
}




/**
 * metadata() callback
 *
 * @callback metadataCallback
 * @param {Error} err Any kind of error
 * @param {object} metadata Duration, size, etc.
 */

/**
 * Get simple metadata for video
 *
 * @param {string} source Path to video file
 * @param {metadataCallback} callback Accepts arguments: (err, metadata)
 */
exports.metadata = function(source, callback) {
  FFmpeg.ffprobe(source, ondata)

  function ondata(err, metadata) {
    if (err) {
      return callback(err)
    }

    var streams = metadata.streams
      , stream

    if (!streams) {
      return callback(new Error('Unknown error running ffprobe'))
    }

    while (stream = streams.shift()) {
      if (stream.codec_type === 'video') {
        return callback(null, {
          duration: parseFloat(metadata.format.duration),
          width:    parseInt(stream.width, 10),
          height:   parseInt(stream.height, 10)
        })
      }
    }

    return callback(new Error('Source video file does not have video stream.'))
  }
}




/**
 * Get widthxheight string from dimensions object
 *
 * @param {object} dimensions width/height object
 * @returns {string}
 */
function toSizeString(dimensions) {
  return dimensions.width + 'x' + dimensions.height
}
exports.toSizeString = toSizeString




/**
 * Create timemark from number
 *
 * @param {float|string} mark
 * @returns {string} Formatted timemark
 */
function toTimemark(mark) {
  var m = moment(mark + '', 'X.SSS')
  return m.utc().format('HH:mm:ss.SSS')
}
exports.toTimemark = toTimemark