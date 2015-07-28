var FaceWord = (function () {
  var settings = {
    contrast: 30
  };

  var ctx,
      matrix;

  function setCanvasContext (canvas) {
    var canvasElm = document.querySelector(canvas);
    ctx = canvasElm.getContext('2d');
  }

	return {
    run: function (img, canvas) {
      setCanvasContext(canvas);

      var imageProcessor = FaceWord.ImageProcessor,
          blockManager   = FaceWord.BlockManager,
          matrix,
          blocks;

      matrix = imageProcessor.generateMatrix(img, ctx);
      blocks = blockManager.generateBlocks(matrix);

      console.log(blocks);
    }
  };
})();
