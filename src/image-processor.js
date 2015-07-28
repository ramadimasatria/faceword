FaceWord.ImageProcessor = (function (FaceWord) {
  var settings  = FaceWord.settings,
      img       = {},
      matrix    = {},
      blockSize = settings.blockSize,
      ctx,
      imageData;

  // Resize image and draw in canvas
  var prepareImage = function () {
    img.width  = img.el.width;
    img.height = img.el.height;
    img.blocks = [];

    ctx.drawImage(img.el, 0, 0, img.width, img.height);

    imageData = ctx.getImageData(0, 0, img.width, img.height);
  };

  var processImage = function () {
    var data = imageData.data;
    var r, g, b, value;
    var contrastRatio = settings.contrast,
        contrastFactor = (259 * (contrastRatio + 255)) / (255 * (259 - contrastRatio));

    for (var i = 0; i < data.length; i+=4) {
      r = data[i];
      g = data[i+1];
      b = data[i+2];

      value = (r + g + b) / 3;                                    // convert to grayscale
      value = truncateValue((contrastFactor*(value-128))+128);    // add contrast
      value = value > 120 ? 255 : 0;                              // posterize

      // change original image
      data[i]   = value;
      data[i+1] = value;
      data[i+2] = value;
    }

    FaceWord.Debug.drawImageData(imageData, '#imageData');
  };

  var pixelate = function () {
    var data  = imageData.data,
        pixelated = [],
        x0, y0, x1, y2,
        row, column,
        value;

    for (y0 = 0; y0 < img.height; y0+=blockSize) {
      row            = y0 / blockSize;
      pixelated[row] = [];
      y1             = y0 + blockSize - 1;
      if (y1 > img.height)
        y1 = img.height -1;

      for (x0 = 0; x0 < img.width; x0+=blockSize) {
        column = x0 / blockSize;
        x1     = x0 + blockSize - 1;
        if (x1 > img.width)
          x1 = img.width -1;

        value = getPixelatedValue(data, x0, y0, x1, y1);
        pixelated[row][column] = value;
      }
    }

    img.pixelated = pixelated;

    FaceWord.Debug.drawPixelatedImage(pixelated, blockSize, '#pixelated');
  };

  var truncateValue = function (val) {
    if (val < 0) return 0;
    if (val > 255) return 255;
    return val;
  };

  var posterizePixel = function (value, treshold) {
    return value > treshold ? 255 : 0;
  };

  var getPixelatedValue = function (data, x0, y0, x1, y1) {
    var sum = 0,
        count = 0,
        brightness,
        value;

    for (var j = y0; j < y1; j++) {
      for (var i = x0; i < x1; i++) {
        brightness = data[((img.width * j) + i) * 4];
        sum += brightness;
        count++;
      }
    }
    value = Math.floor(sum/count);

    return value;
    // return posterizePixel(value, 200);
  };

  var encodeMatrix = function  () {
    var pixelated = img.pixelated,
        valueMap = [],
        data     = [];

    for (var y = 0; y < pixelated.length; y++) {
      data[y] = [];
      for (var x = 0; x < pixelated[y].length; x++) {
        var valueIndex = valueMap.indexOf(pixelated[y][x]);
        if (valueIndex === -1) {
          valueMap.push(pixelated[y][x]);
          data[y][x] = valueMap.length - 1;
        } else {
          data[y][x] = valueIndex;
        }
      }
    }

    matrix = {
      data:      data,
      valueMap:  valueMap,
      blockSize: blockSize,
    };

    FaceWord.Debug.printMatrix(matrix.data, '#matrix');
  };

  return {
    img: img,
    generateMatrix: function (image, context) {
      img.el = image;
      ctx    = context;

      prepareImage();
      processImage();
      pixelate();
      encodeMatrix();

      return matrix;
    }
  };
})(FaceWord || {});
