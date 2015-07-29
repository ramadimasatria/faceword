var FaceWord = (function () {
  var settings = {
    contrast:  -10,
    blockSize: 5
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

      fillText(block);
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

  function fillText (block) {
    var word = wordManager.getRandomWord(),
        x = block.x,
        y = block.y,
        width = block.width,
        height = block.height,
        fontSize,
        fontOffset;

    fontSize = measureFontSize(word, ctx, width, height);
    fontHeight = fontSize * 0.7;

    ctx.font = fontSize + 'px serif';
    ctx.fillText(word, x, y+fontHeight, width);

    // Run the function again if there's an extra space
    var extraHeight = height - fontHeight,
        extraBlock;

    if (extraHeight > 10) {
        extraBlock = {
            x:      block.x,
            y:      block.y + fontHeight + 2, // add some extra pixel
            width:  block.width,
            height: extraHeight
        };
        fillText(extraBlock);
    }

    // Return optimal font size
    function measureFontSize (word, ctx, maxWidth, maxHeight) {
        var size = 4,
            wDiff,
            textWidth;

        ctx.font = size + 'px serif';
        textWidth = ctx.measureText(word).width;
        wDiff = maxWidth - textWidth;

        if (wDiff < 0) {
            return size;
        }

        while(wDiff > 0){
            size += 2;
            ctx.font = size + 'px serif';
            textWidth = ctx.measureText(word).width;
            wDiff = maxWidth - textWidth;
        }

        return size - 2;
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
