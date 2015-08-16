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
    var data  = imageData.data,
        matrixData = [],
        blockSize = settings.blockSize,
        x0, y0, x1, y1,
        matrix, row, column,
        value, valueIndex, valueMap;

    valueMap = _generateValueMap();

    for (y0 = 0; y0 < image.height; y0+=blockSize) {
      row            = y0 / blockSize;
      matrixData[row] = [];
      y1             = y0 + blockSize - 1;
      if (y1 > image.height){
        y1 = image.height -1;
      }

      for (x0 = 0; x0 < image.width; x0+=blockSize) {
        column = x0 / blockSize;
        x1     = x0 + blockSize - 1;
        if (x1 > image.width) {
          x1 = image.width -1;
        }

        value = _getPixelatedValue(data, x0, y0, x1, y1);
        value = _getClosestValue(value, valueMap);

        valueIndex = valueMap.indexOf(value);

        matrixData[row][column] = valueIndex;
      }
    }

    matrix = {
      data:      matrixData,
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
    if (settings.inverse) {
      value = _inverseValue(value);
    }

    return value;
  }

  function _truncateValue (val) {
    if (val < 0) {return 0;}
    if (val > 255) {return 255;}
    return val;
  }

  function _inverseValue (val) {
    return 255 - val;
  }

  function _generateValueMap () {
    var colors = settings.colors,
        valueMap = [],
        value;

    for (var i = colors; i >= 0; i--) {
      value = Math.floor(255 * (i/colors));

      if (settings.darkMode) {
        value = _inverseValue(value);
      }

      valueMap.push(value);
    }

    return valueMap;
  }

  function _getClosestValue (pixelatedValue, valueMap) {
    var treshold,
        value;

    treshold = Math.floor((Math.abs(valueMap[1] - valueMap[0])) / 2);

    for (var i = 0; i < valueMap.length; i++) {
      if (Math.abs(pixelatedValue - valueMap[i]) < treshold) {
        value = valueMap[i];
        break;
      }
    }

    return value;
  }

  /////////////////

  return {
    init:    init,
    process: process,
    encode:  encode
  };
})(FaceWord || {});
