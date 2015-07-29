var FaceWord = (function () {
  var iter = 1;

  var settings = {
    contrast:    -10,
    blockSize:   5,
    minFontSize: 2,
    maxFontSize: 16,
    minHeight:   5,
    minWidth:    5,
  };

  var canvasEl,
      ctx,
      matrix,
      imageProcessor,
      blockManager,
      wordManager;

  function setCanvasContext (canvas) {
    canvasEl = document.querySelector(canvas);
    ctx = canvasEl.getContext('2d');
  }

  function render (blocks) {
    ctx.clearRect(0, 0, canvasEl.width, canvas.height);
    for (var i = 0; i < blocks.length; i++) {
      var block = restoreBlockSize(blocks[i]);

      renderText(block);
    }
  }

  function restoreBlockSize (block) {
    var blockSize = settings.blockSize;
    return {
      x:      block.x * blockSize,
      y:      block.y * blockSize,
      width:  block.width * blockSize,
      height: block.height * blockSize,
      color:  block.color
    };
  }

  function renderText (block) {
    var word = wordManager.getRandomWord(),
        x = block.x,
        y = block.y,
        width = block.width,
        height = block.height,
        fontMeasure = measureFont(word, ctx, width, height),
        fontSize,
        fontOffset;

    if (!fontMeasure) return;

    fontSize = fontMeasure[0];
    fontWidth = fontMeasure[1];
    fontHeight = fontSize * 0.8;

    ctx.font = fontSize + 'px serif';
    ctx.fillText(word, x, y+fontHeight, width);

    // Return optimal font size
    function measureFont (word, ctx, maxWidth, maxHeight) {
        var size = settings.minFontSize,
            wDiff,
            textWidth,
            maxTextWidth;


        ctx.font = size + 'px serif';
        textWidth = ctx.measureText(word).width;
        wDiff = maxWidth - textWidth;

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
  }

  return {
    settings: settings,
    run: function (img, text, canvas) {
      var matrix, blocks;

      setCanvasContext(canvas);

      imageProcessor = FaceWord.ImageProcessor;
      blockManager   = FaceWord.BlockManager;
      wordManager    = FaceWord.WordManager;
      wordManager.init(text);

      matrix = imageProcessor.generateMatrix(img, ctx);
      blocks = blockManager.generateBlocks(matrix);

      render(blocks);

      FaceWord.Debug.drawBlocks(blocks, settings.blockSize, '#blocks', true);
    }
  };
})();
