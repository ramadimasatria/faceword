FaceWord.ImageProcessor = (function (FaceWord) {
  var image,
      ctx,
      settings;

  function init () {
    image    = {};
    ctx      = FaceWord.getCanvasContext();
    settings = FaceWord.getSettings();
  }

  function process (img) {
    var contrastRatio = settings.contrast,
        contrastFactor = (259 * (contrastRatio + 255)) / (255 * (259 - contrastRatio)),
        imageData,
        data, r, g, b, value;

    _prepareImage(img);

    imageData = ctx.getImageData(0, 0, image.width, image.height);
    data = imageData.data;

    for (var i = 0; i < data.length; i+=4) {
      r = data[i];
      g = data[i+1];
      b = data[i+2];

      value = (r + g + b) / 3;                                    // convert to grayscale
      value = _truncateValue((contrastFactor*(value-128))+128);    // add contrast
      value = value > 120 ? 255 : 0;                              // posterize

      // change original image
      data[i]   = value;
      data[i+1] = value;
      data[i+2] = value;
    }

    return imageData;
  }

  function encode (imageData) {
    var pixelated = _pixelate(imageData),
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
    };

    return matrix;
  }

  ///////////////// Private Functions

  function _prepareImage (img) {
    image.el = img;
    image.width  = img.width;
    image.height = img.height;

    ctx.drawImage(image.el, 0, 0, image.width, image.height);
  }

  function _pixelate (imageData) {
    var data  = imageData.data,
        pixelated = [],
        blockSize = settings.blockSize,
        x0, y0, x1, y2,
        row, column,
        value;

    for (y0 = 0; y0 < image.height; y0+=blockSize) {
      row            = y0 / blockSize;
      pixelated[row] = [];
      y1             = y0 + blockSize - 1;
      if (y1 > image.height)
        y1 = image.height -1;

      for (x0 = 0; x0 < image.width; x0+=blockSize) {
        column = x0 / blockSize;
        x1     = x0 + blockSize - 1;
        if (x1 > image.width)
          x1 = image.width -1;

        value = _getPixelatedValue(data, x0, y0, x1, y1);
        pixelated[row][column] = value;
      }
    }

    return pixelated;
  }

  function _getPixelatedValue (data, x0, y0, x1, y1) {
    var sum = 0,
        count = 0,
        brightness,
        value;

    for (var j = y0; j < y1; j++) {
      for (var i = x0; i < x1; i++) {
        brightness = data[((image.width * j) + i) * 4];
        sum += brightness;
        count++;
      }
    }
    value = Math.floor(sum/count);

    // return value;
    return value > 200 ? 255 : 0;
  }

  function _truncateValue (val) {
    if (val < 0) return 0;
    if (val > 255) return 255;
    return val;
  }

  /////////////////

  return {
    init:    init,
    process: process,
    encode:  encode
  };
})(FaceWord || {});
