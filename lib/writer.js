'use strict'

var fs = require('fs')
  , util = require('util')
  , utils = require('./utils')
  , Writable = require('stream').Writable




/**
 * Abstract WebVTT writer. Should be extended
 *
 * @constructor
 * @extends {Writable}
 * @param {object} metadata Video file metadata
 * @param {object} options Generator options
 * @param {string[]} filenames Thumbnail filenames
 */
function Writer(metadata, options, filenames) {
  Writable.call(this, options)
  var self = this

  this.metadata = metadata
  this.options = options
  this.filenames = filenames

  this.ws = fs.createWriteStream(options.output)
  // write header first
  this.ws.write('WEBVTT', 'utf8')


  this.ws.on('error', onerror)
  this.on('internalError', oniternalerror)
  this.on('finish', onfinish)

  function onerror(err) {
    self.emit('error', err)
  }

  function oniternalerror() {
    self.emit('error')
    self.ws.end()
  }

  function onfinish() {
    self.ws.end()
  }
}
util.inherits(Writer, Writable)




/**
 * Write thumbnail data
 *
 * @private
 * @param {string} str Data to write
 * @param {string} encoding Data encoding
 * @param {function} callback Accepts arguments: (err, data)
 */
Writer.prototype._write = function(str, encoding, callback) {
  this.ws.write(str, encoding, callback)
}




/**
 * Write thumbnails specs to VTT
 *
 * @protected
 * @param {string[]} thumbnails List of thumbnails filenames
 */
Writer.prototype._writeInfo = function(thumbnails) {
  var self = this
    , bounds = this.options.bounds
    , length = thumbnails.length
    , thumbnail
    , i = 0
    , bound
    , out = []

  while (thumbnail = thumbnails[i]) {
    bound = bounds[i]

    var data = {
      path: thumbnail,
      from: utils.toTimemark(bound)
    }

    if (i === length - 1) {
      data.to = utils.toTimemark(Number(this.metadata.duration).toFixed(3))
    }
    else {
      data.to = utils.toTimemark(bounds[i+1])
    }

    out.push(data)
    this.write(this.toThumbString(data))

    i++
  }

  this.end()
  this.on('finish', function() {
    self.emit('success', out)
  })
}




/**
 * Write thumbnail data
 *
 * @protected
 * @param {object} data Thumbnail data
 * @returns {string} Thumbnail string
 */
Writer.prototype.toThumbString = function(data) {
  return ['\n\n', data.from, ' --> ', data.to, '\n', data.path].join('')
}




module.exports = Writer