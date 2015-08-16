FaceWord = (function () {
  'use strict';

  var settings = {
    contrast:      0,
    blockSize:     5,
    minFontSize:   2,
    maxFontSize:   48,
    imgMaxWidth:   600,
    fontFamily:    'serif',
    fontWeight:    400,
    colors:        8,
    inverse:       false,
    darkMode:      false,
    orientation:   'mixed'
  };

  var image,
      canvas,
      text,
      ctx;

  /**
   * Main function
   *
   * @param  {element}  i   input image (Image or Canvas)
   * @param  {string}   t   text
   * @param  {string}   c   canvas selector
   * @param  {object}   s   settings object
   *
   * @return {promise}
   */
  function run (i, t, c, s) {
    var promise;

    promise = new Promise(function (resolve, reject) {
      window.setTimeout(function() {  // Make the function asynchronous
        try{
          _init(i, t, c, s);
          _drawCanvas();
        }catch(e){
          reject(e.message);
        }

        resolve();
      }, 1);
    });

    return promise;
  }

  /**
   * Getter function for canvas context
   *
   * @return {CanvasRenderingContext2D}
   */
  function getCanvasContext () {
    return ctx;
  }

  /**
   * Clear working canvas
   */
  function clearCanvas () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Getter function for settings object
   *
   * @return {object} settings object
   */
  function getSettings () {
    return settings;
  }

  ////////////////// Private Functions

  function _init (i, t, c, s) {
    for(var prop in s) {
      if(s.hasOwnProperty(prop)){
        settings[prop] = s[prop];
      }
    }

    image  = _validateImage(i);
    text   = _validateText(t);
    canvas = _validateCanvas(c);

    ctx = canvas.getContext('2d');

    FaceWord.ImageProcessor.init();
    FaceWord.BlockManager.init();
    FaceWord.WordManager.init(t);
  }

  function _isImage (node) {
    return node instanceof HTMLImageElement && node.src;
  }

  function _isCanvas (node) {
    return node instanceof HTMLCanvasElement;
  }

  function _validateImage (img) {
    var image = new Image();

    if (_isImage(img)) {
      image.src = img.src;
    } else if (_isCanvas(img)) {
      image.src = img.toDataURL();
    } else {
      throw new Error('Invalid image');
    }

    image.width  = Math.min(img.width, settings.imgMaxWidth);
    image.height = img.height;

    return image;
  }

  function _validateText (text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text');
    }

    return text;
  }

  function _validateCanvas (selector) {
    var cnvs = document.querySelector(selector);

    if (!cnvs || !(cnvs instanceof HTMLCanvasElement)) {
      throw new Error('Invalid canvas selector');
    }

    cnvs.width  = image.width;
    cnvs.height = image.height;

    return cnvs;
  }

  function _drawCanvas () {
    var imageData,
        matrix,
        weightedMatrix,
        block,
        blockExist,
        color;

    imageData = FaceWord.ImageProcessor.process(image);
    matrix    = FaceWord.ImageProcessor.encode(imageData);

    clearCanvas();

    _drawBackground(matrix.valueMap[0]);

    for (var i = 1; i < matrix.valueMap.length; i++) {
      color = matrix.valueMap[i];
      weightedMatrix = FaceWord.BlockManager.weighMatrix(matrix.data, i);
      blockExist = true;

      while(blockExist){
        block = FaceWord.BlockManager.getBlock(weightedMatrix);

        if (block) {
          _renderBlock(block, color);
          FaceWord.BlockManager.normalize(weightedMatrix, block);
        } else {
          blockExist = false;
        }
      }
    }
  }

  function _drawBackground (color) {
    ctx.fillStyle = 'rgb('+color+','+color+','+color+')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
  }

  function _renderBlock (block, color) {
    var restoredBlock =  _restoreBlockSize(block);

    var word        = FaceWord.WordManager.getWord(),
        x           = restoredBlock.x,
        y           = restoredBlock.y,
        width       = restoredBlock.width,
        height      = restoredBlock.height,
        fontMeasure = _measureFont(word, width, height),
        fontSize, fontWidth, fontHeight;

    if (!fontMeasure) {return;}

    fontSize   = fontMeasure[0];
    fontWidth  = fontMeasure[1];
    fontHeight = Math.ceil(fontSize * 0.8);

    ctx.font         = _setFontProperty(fontSize, settings.fontWeight, settings.fontFamily);
    ctx.textBaseline = 'hanging';
    ctx.fillStyle    = 'rgb('+color+','+color+','+color+')';
    ctx.fillText(word, x, y, width);

    ctx.restore();

    _assignRenderedSize(block, fontWidth, fontHeight);
  }

  function _restoreBlockSize (block) {
    var blockSize = settings.blockSize;
    return {
      x:      block.x * blockSize,
      y:      block.y * blockSize,
      width:  block.width * blockSize,
      height: block.height * blockSize,
    };
  }

  function _measureFont (word, maxWidth, maxHeight) {
    var size = settings.minFontSize,
        wDiff,
        textWidth,
        maxTextWidth;

    ctx.font  = _setFontProperty(size, settings.fontWeight, settings.fontFamily);
    textWidth = ctx.measureText(word).width;
    wDiff     = maxWidth - textWidth;

    if (wDiff < 0) {
        return false;
    }

    while(wDiff > 0 && size < maxHeight && size < settings.maxFontSize){
      maxTextWidth = textWidth;

      size += 1;
      ctx.font = _setFontProperty(size, settings.fontWeight, settings.fontFamily);
      textWidth = ctx.measureText(word).width;
      wDiff = maxWidth - textWidth;
    }
    return [size - 1, maxTextWidth];
  }

  function _assignRenderedSize (block, width, height) {
    block.renderedWidth  = Math.ceil(width / settings.blockSize);
    block.renderedHeight = Math.ceil(height / settings.blockSize);
  }

  function _setFontProperty (fontSize, fontWeight, fontFamily) {
    return fontWeight + ' ' + fontSize + 'px ' + fontFamily;
  }

  //////////////////

  return {
    getCanvasContext: getCanvasContext,
    clearCanvas:      clearCanvas,
    getSettings:      getSettings,
    run:              run,
  };

})();
