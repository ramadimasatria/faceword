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
    for (var i = 0; i < blocks.length; i++) {
      var block = restoreBlockSize(blocks[i]);

      ctx.fillStyle = 'rgb('+block.color+','+block.color+','+block.color+')';
      ctx.fillRect(block.x, block.y, block.width, block.height);
    }
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
