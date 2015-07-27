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

      var imageProcessor = FaceWord.ImageProcessor.init(img, ctx);
      var matrix         = imageProcessor.getMatrix();
      var blockManager   = FaceWord.BlockManager.init(matrix);
    }
  };
})();
