# Video thumbnails + WebVTT using Node.js

Thumbnails generator module. Uses [WebVTT](http://dev.w3.org/html5/webvtt/) as thumbnails descriptor. Can pack thumbnails into spritesheet using [node-sprit]() module.

## Installation

    npm install thumbnails-webvtt --save

## Requirements

* [ffmpeg](https://www.ffmpeg.org/) used by `fluent-ffmpeg` 
* [ImageMagick](http://www.imagemagick.org/) as used by `node-sprite`

## Example

```javascript
'use strict'

var thumbgen = require('thumbnails-webvtt')

thumbgen('/media/Hammer.of.the.Gods.2013.BluRay.720p.mkv', {
  output:          '/vtt/Hammer.of.the.Gods.2013.BluRay.720p.vtt',
  size:            {
    width: 480
  },
  numThumbnails:   6,
  spritesheet:     true
}, function(err, metadata) {
  if (err) {
    throw err
  }
  
  console.dir(metadata)
})
```

will print

```javascript
[ { path: '/Hammer.of.the.Gods.2013.BluRay.720p/thumbnails.png#xywh=0,808,480,200',
    from: '00:00:00.000',
    to: '00:14:49.474' },
  { path: '/Hammer.of.the.Gods.2013.BluRay.720p/thumbnails.png#xywh=0,0,480,200',
    from: '00:14:49.474',
    to: '00:29:38.947' },
  { path: '/Hammer.of.the.Gods.2013.BluRay.720p/thumbnails.png#xywh=0,202,480,200',
    from: '00:29:38.947',
    to: '00:44:28.421' },
  { path: '/Hammer.of.the.Gods.2013.BluRay.720p/thumbnails.png#xywh=0,404,480,200',
    from: '00:44:28.421',
    to: '00:59:17.894' },
  { path: '/Hammer.of.the.Gods.2013.BluRay.720p/thumbnails.png#xywh=0,606,480,200',
    from: '00:59:17.894',
    to: '01:14:07.368' },
  { path: '/Hammer.of.the.Gods.2013.BluRay.720p/thumbnails.png#xywh=0,1010,480,200',
    from: '01:14:07.368',
    to: '01:38:49.824' } ]
```

## API

### thumbgen(source, options, callback)

Create thumbnails (and optionally pack them into spritesheet) and create WebVTT file for file(s). Options are described below

## Options

* **output** defaults to `"SOURCE_DIR/SOURCE_BASENAME.vtt"`

    * WebVTT filename

* **assetsDirectory** defaults to `"SOURCE_BASENAME"`

    * Name of folder which keeps thumbnails or spritesheet.

* **size** defaults to `null`

    * Size of generated thumbnails. If not specified original video stream `width` and `height` will be used. If only `width` or `height` is specified other will be computed according to source video ratio.

* **size.width** defaults to `SOURCE_WIDTH`  

    * Read above

* **size.height** defaults to `SOURCE_HEIGHT`  

    * Read above

* **timemarks** defaults to `null`

    * Array with timemarks in seconds. E.g. ['123.123', '345.345']

* **numThumbnails** defaults to `0`

    * Number of thumbnails to generate. Used in opposite to `timemarks`. Each thumbnail moment is calculated as `source_duration * 0.9 / numThumbnails`.

* **secondsPerThumbnail** defaults to `0`

    * If specified thumbnails will be generated each `secondsPerThumbnail` seconds.

* **framesPerThumbnail** defaults to `0`

    * If specified thumbnails will be generated each `framesPerThumbnail` frames.

* **spritesheet** defaults to `false`

    * Generate spritesheet or not.

* **spriteSheetName** defaults to `"thumbnails"`

    * Spritesheet file name

* **spriteSheetOptions** default to `null`

    * Spritesheet options passed to [node-sprite](https://github.com/naltatis/node-sprite#options) `.sprite()` function.

## TODO

* Use cool spritesheet generator
* Tests
* Use some kind of WebVTT generator?
