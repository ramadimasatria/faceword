FaceWord = (function () {
  var settings = {
    contrast:    -10,
    blockSize:   5,
    minFontSize: 2,
    minHeight:   5,
    minWidth:    5,
  };

  var image,
      text,
      canvas,
      ctx;

  function init (img, txt, cnv) {
    image  = img;
    text   = txt;
    setCanvasContext(cnv);

    FaceWord.ImageProcessor.init();
    FaceWord.BlockManager.init();
    FaceWord.WordManager.init(text);
  }

  function setCanvasContext (selector) {
    canvas = document.querySelector(selector);
    ctx = canvas.getContext('2d');
  }

  function getCanvasContext () {
    return ctx;
  }

  function clearCanvas () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function getSettings () {
    return settings;
  }

  function run () {
    var imageData = FaceWord.ImageProcessor.process(image);
    var matrix    = FaceWord.ImageProcessor.encode(imageData),
        weightedMatrix,
        block,
        blockImageData,
        blockMatrix;

    clearCanvas();
    for (var i = 1; i < matrix.valueMap.length; i++) {
      weightedMatrix = FaceWord.BlockManager.weighMatrix(matrix.data, i);

      block = FaceWord.BlockManager.getBlock(weightedMatrix);
      block = _restoreBlockSize(block);

      _renderBlock(block);
    }

  }

  //////////////////

  function _renderBlock (block) {
    var word        = FaceWord.WordManager.getWord(),
        x           = block.x,
        y           = block.y,
        width       = block.width,
        height      = block.height,
        fontMeasure = _measureFont(word, width, height),
        fontSize;

    if (!fontMeasure) return;

    fontSize = fontMeasure[0];
    fontWidth = fontMeasure[1];
    fontHeight = fontSize * 0.8;

    ctx.font = fontSize + 'px serif';
    ctx.fillText(word, x, y+fontHeight, width);

    block.renderedWidth  = Math.ceil(fontWidth);
    block.renderedHeight = Math.ceil(fontHeight);
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

  //////////////////

  return {
    init:             init,
    setCanvasContext: setCanvasContext,
    getCanvasContext: getCanvasContext,
    clearCanvas:      clearCanvas,
    getSettings:      getSettings,
    run:              run,
  };
})();