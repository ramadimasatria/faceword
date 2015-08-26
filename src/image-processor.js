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

      // Add contrast
      data[i]   = _truncateValue((contrastFactor*(r-128))+128);
      data[i+1] = _truncateValue((contrastFactor*(g-128))+128);
      data[i+2] = _truncateValue((contrastFactor*(b-128))+128);
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
        closestValue = _getClosestValue(value, valueMap);

        matrixData[row][column] = closestValue[0];
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
    var sumR = 0,
        sumG = 0,
        sumB = 0,
        count = 0,
        pixelIndex, r, g, b,
        value;

    for (var j = y0; j < y1; j++) {
      for (var i = x0; i < x1; i++) {
        pixelIndex = ((image.width * j) + i) * 4;

        r = data[pixelIndex];
        g = data[pixelIndex+1];
        b = data[pixelIndex+2];

        sumR += r;
        sumG += g;
        sumB += b;

        count++;
      }
    }

    value = [
      [Math.floor(sumR/count)],
      [Math.floor(sumG/count)],
      [Math.floor(sumB/count)]
    ];

    if (settings.inverse) {
      value[0] = _inverseValue(value[0]);
      value[1] = _inverseValue(value[1]);
      value[2] = _inverseValue(value[2]);
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
    // TODO: validate colors

    return settings.colorSet;
  }

  function _getClosestValue (pixelatedValue, valueMap) {
    var minDistance = 99999,
        distance,
        observedValue,
        value, valueIndex;

    for (var i = 0; i < valueMap.length; i++) {
      // Get euclidean distance
      observedValue = valueMap[i];
      distance = Math.sqrt(Math.pow(pixelatedValue[0] - observedValue[0], 2) + Math.pow(pixelatedValue[1] - observedValue[1], 2) + Math.pow(pixelatedValue[2] - observedValue[2], 2));

      if (distance < minDistance) {
        minDistance = distance;
        value = observedValue;
        valueIndex = i;
      }
    }

    return [valueIndex, value];
  }

  /////////////////

  return {
    init:    init,
    process: process,
    encode:  encode
  };
})(FaceWord || {});
