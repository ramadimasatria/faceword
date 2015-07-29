var FaceWord = (function () {
  var settings = {
    contrast:  -10,
    blockSize: 5
  };

  var canvasEl,
      ctx,
      matrix;

  function setCanvasContext (canvas) {
    canvasEl = document.querySelector(canvas);
    ctx = canvasEl.getContext('2d');
  }

  function render (blocks) {
    ctx.clearRect(0, 0, canvasEl.width, canvas.height);

    FaceWord.Debug.drawBlocks(blocks, settings.blockSize, '#blocks', true);
  }

  function restoreBlockSize (block) {
    var blockSize = settings.blockSize;
    return {
      x: block.x * blockSize,
      y: block.y * blockSize,
      width: block.width * blockSize,
      height: block.height * blockSize,
      color: block.color
    };
  }

  function fillText (block) {
    // body...
  }

	return {
    settings: settings,
    run: function (img, canvas) {
      setCanvasContext(canvas);

      var imageProcessor = FaceWord.ImageProcessor,
          blockManager   = FaceWord.BlockManager,
          matrix,
          blocks;

      matrix = imageProcessor.generateMatrix(img, ctx);
      blocks = blockManager.generateBlocks(matrix);

      render(blocks);
    }
  };
})();
