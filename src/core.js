FaceWord = (function () {
  var settings = {
    contrast:      -10,
    blockSize:     5,
    minFontSize:   2,
    minHeight:     5,
    minWidth:      5,
    maxImageSize:  600,
    blockMinWidth: 3,
  };

  var image,
      canvas,
      ctx;

  /**
   * Init function
   * 
   * @param  {element}  i   image element
   * @param  {string}   t   text
   * @param  {string}   c   canvas selector
   * @param  {object}   s   settings object
   */
  function init (i, t, c, s) {
    for(var prop in s) {
      if(s.hasOwnProperty(prop)){
        settings[prop] = s[prop];
      }
    }

    image  = _validateImage(i);

    _setCanvasContext(c);

    FaceWord.ImageProcessor.init(image);
    FaceWord.BlockManager.init();
    FaceWord.WordManager.init(t);
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

  /**
   * Where the magic happens
   */
  function run () {
    var imageData = FaceWord.ImageProcessor.process(image);
    var matrix    = FaceWord.ImageProcessor.encode(imageData),
        weightedMatrix,
        block,
        blockExist;

    clearCanvas();
    for (var i = 1; i < matrix.valueMap.length; i++) {
      weightedMatrix = FaceWord.BlockManager.weighMatrix(matrix.data, i);
      blockExist = true;

      while(blockExist){
        block = FaceWord.BlockManager.getBlock(weightedMatrix);

        if (block) {
          _renderBlock(block);
          FaceWord.BlockManager.normalize(weightedMatrix, block);
        } else {
          blockExist = false;
        }
      }
    }

  }

  ////////////////// Private Functions

  function _setCanvasContext (selector) {
    canvas        = document.querySelector(selector);
    canvas.width  = image.width;
    canvas.height = image.height;

    ctx           = canvas.getContext('2d');
  }

  function _validateImage (img) {
    img.width  = Math.min(img.width, settings.maxImageSize);
    img.height = Math.min(img.height, settings.maxImageSize);

    return img;
  }

  function _renderBlock (block) {
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

    ctx.font = fontSize + 'px serif';
    ctx.fillText(word, x, y+fontHeight, width);

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

    ctx.font  = size + 'px serif';
    textWidth = ctx.measureText(word).width;
    wDiff     = maxWidth - textWidth;

    if (wDiff < 0) {
        return false;
    }

    while(wDiff > 0 && size < maxHeight){
      maxTextWidth = textWidth;

      size += 1;
      ctx.font = size + 'px serif';
      textWidth = ctx.measureText(word).width;
      wDiff = maxWidth - textWidth;
    }
    return [size - 1, maxTextWidth];
  }

  function _assignRenderedSize (block, width, height) {
    block.renderedWidth  = Math.ceil(width / settings.blockSize);
    block.renderedHeight = Math.ceil(height / settings.blockSize);
  }

  //////////////////

  return {
    init:             init,
    getCanvasContext: getCanvasContext,
    clearCanvas:      clearCanvas,
    getSettings:      getSettings,
    run:              run,
  };

})();
