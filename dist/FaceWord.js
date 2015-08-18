/*! FaceWord - v0.0.5 - 2015-08-18
* Copyright (c) 2015 Rama Dimasatria; Licensed  */
FaceWord = (function () {
  'use strict';

  var settings = {
    contrast:      0,
    blockSize:     5,
    minFontSize:   2,
    maxFontSize:   48,
    imgMaxWidth:   600,
    fontFamily:    'serif',
    fontWeight:    400,
    colors:        8,
    inverse:       false,
    darkMode:      false,

    // Future settings
    orientation:   'mixed'
  };

  var image,
      canvas,
      text,
      ctx;

  /**
   * Main function
   *
   * @param  {element}  i   input image (Image or Canvas)
   * @param  {string}   t   text
   * @param  {string}   c   canvas selector
   * @param  {object}   s   settings object
   *
   * @return {promise}
   */
  function run (i, t, c, s) {
    var promise;

    promise = new Promise(function (resolve, reject) {
      window.setTimeout(function() {  // Make the function asynchronous
        try{
          _init(i, t, c, s);
          _drawCanvas();
        }catch(e){
          reject(e.message);
        }

        resolve();
      }, 1);
    });

    return promise;
  }

  /**
   * Getter function for canvas context
   *
   * @return {CanvasRenderingContext2D}
   */
  function getCanvasContext () {
    return ctx;
  }

  /**
   * Clear working canvas
   */
  function clearCanvas () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Getter function for settings object
   *
   * @return {object} settings object
   */
  function getSettings () {
    return settings;
  }

  ////////////////// Private Functions

  function _init (i, t, c, s) {
    for(var prop in s) {
      if(s.hasOwnProperty(prop)){
        settings[prop] = s[prop];
      }
    }

    image  = _validateImage(i);
    text   = _validateText(t);
    canvas = _validateCanvas(c);

    ctx = canvas.getContext('2d');

    FaceWord.ImageProcessor.init();
    FaceWord.BlockManager.init();
    FaceWord.WordManager.init(t);
  }

  function _isImage (node) {
    return node instanceof HTMLImageElement && node.src;
  }

  function _isCanvas (node) {
    return node instanceof HTMLCanvasElement;
  }

  function _validateImage (img) {
    var image = new Image();

    if (_isImage(img)) {
      image.src = img.src;
    } else if (_isCanvas(img)) {
      image.src = img.toDataURL();
    } else {
      throw new Error('Invalid image');
    }

    image.width  = Math.min(img.width, settings.imgMaxWidth);
    image.height = img.height;

    return image;
  }

  function _validateText (text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text');
    }

    return text;
  }

  function _validateCanvas (selector) {
    var cnvs = document.querySelector(selector);

    if (!cnvs || !(cnvs instanceof HTMLCanvasElement)) {
      throw new Error('Invalid canvas selector');
    }

    cnvs.width  = image.width;
    cnvs.height = image.height;

    return cnvs;
  }

  function _drawCanvas () {
    var imageData,
        matrix,
        weightedMatrix,
        block,
        blockExist,
        color,
        backgroundColor;

    imageData = FaceWord.ImageProcessor.process(image);
    matrix    = FaceWord.ImageProcessor.encode(imageData);

    clearCanvas();

    backgroundColor = settings.backgroundColor ? settings.backgroundColor : _setColor(matrix.valueMap[0]);
    _drawBackground(backgroundColor);

    for (var i = 1; i < matrix.valueMap.length; i++) {
      color = _setColor(matrix.valueMap[i]);
      weightedMatrix = FaceWord.BlockManager.weighMatrix(matrix.data, i);
      blockExist = true;

      while(blockExist){
        block = FaceWord.BlockManager.getBlock(weightedMatrix);

        if (block) {
          _renderBlock(block, color);
          FaceWord.BlockManager.normalize(weightedMatrix, block);
        } else {
          blockExist = false;
        }
      }
    }
  }

  function _drawBackground (color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
  }

  function _renderBlock (block, color) {
    var restoredBlock =  _restoreBlockSize(block);

    var word        = FaceWord.WordManager.getWord(),
        x           = restoredBlock.x,
        y           = restoredBlock.y,
        width       = restoredBlock.width,
        height      = restoredBlock.height,
        fontMeasure = _measureFont(word, width, height),
        fontSize, fontWidth, fontHeight;

    if (!fontMeasure) {return;}

    fontSize   = fontMeasure[0];
    fontWidth  = fontMeasure[1];
    fontHeight = Math.ceil(fontSize * 0.8);

    ctx.font         = _setFontProperty(fontSize, settings.fontWeight, settings.fontFamily);
    ctx.textBaseline = 'hanging';
    ctx.fillStyle    = color;
    ctx.fillText(word, x, y, width);

    ctx.restore();

    _assignRenderedSize(block, fontWidth, fontHeight);
  }

  function _restoreBlockSize (block) {
    var blockSize = settings.blockSize;
    return {
      x:      block.x * blockSize,
      y:      block.y * blockSize,
      width:  block.width * blockSize,
      height: block.height * blockSize,
    };
  }

  function _measureFont (word, maxWidth, maxHeight) {
    var size = settings.minFontSize,
        wDiff,
        textWidth,
        maxTextWidth;

    ctx.font  = _setFontProperty(size, settings.fontWeight, settings.fontFamily);
    textWidth = ctx.measureText(word).width;
    wDiff     = maxWidth - textWidth;

    if (wDiff < 0) {
        return false;
    }

    while(wDiff > 0 && size < maxHeight && size < settings.maxFontSize){
      maxTextWidth = textWidth;

      size += 1;
      ctx.font = _setFontProperty(size, settings.fontWeight, settings.fontFamily);
      textWidth = ctx.measureText(word).width;
      wDiff = maxWidth - textWidth;
    }
    return [size - 1, maxTextWidth];
  }

  function _assignRenderedSize (block, width, height) {
    block.renderedWidth  = Math.ceil(width / settings.blockSize);
    block.renderedHeight = Math.ceil(height / settings.blockSize);
  }

  function _setFontProperty (fontSize, fontWeight, fontFamily) {
    return fontWeight + ' ' + fontSize + 'px ' + fontFamily;
  }

  function _setColor (brightness) {
    return 'rgb('+brightness+', '+brightness+','+brightness+')';
  }

  //////////////////

  return {
    getCanvasContext: getCanvasContext,
    clearCanvas:      clearCanvas,
    getSettings:      getSettings,
    run:              run,
  };

})();

FaceWord.BlockManager = (function (FaceWord) {
  var settings;

  function init () {
    settings = FaceWord.getSettings();
  }

  function weighMatrix (matrix, observedValue) {
    var rows           = matrix.length,
        columns        = matrix[0].length,
        weightedMatrix = [];

    var value, weight, x, y;

    // weight column from right to left
    for (y = 0; y < rows; y++) {
        weight = 0;
        weightedMatrix[y] = [];

        for (x = columns-1; x >= 0; x--) {
            value = matrix[y][x];

            if (value === observedValue) {
              weight++;
            } else {
              weight = 0;
            }

            weightedMatrix[y][x] = [weight];
        }
    }

    // weight row from bottom to top
    for (x = 0; x < columns; x++) {
        weight = 0;
        for (y = rows-1; y >= 0; y--) {
            value = matrix[y][x];

            if (value === observedValue) {
              weight++;
            } else {
              weight = 0;
            }

            weightedMatrix[y][x][1] = weight;
        }
    }

    return weightedMatrix;
  }

  function getBlock (weightedMatrix) {
    var cell = _getMaxWeightedCell(weightedMatrix),
        block   = {},
        x, y,
        maxArea, maxHeight,
        prevWidth, width, height;

    if (!cell) {return false;}

    x            = cell.x;
    y            = cell.y;
    maxArea      = 0;
    maxHeight    = cell.rowWeight;
    prevWidth    = cell.colWeight;
    for (var row = 0; row < maxHeight; row++) {
      var observedCell = weightedMatrix[y+row][x],
          observedArea;

      width = Math.min(prevWidth, observedCell[0]);
      height = row+1;
      observedArea = width * height;

      if (observedArea >= maxArea) {
        maxArea = observedArea;
        prevWidth = width;
      } else {
        height = row;
        width = prevWidth;
        break;
      }
    }

    block = {
      x:      x,
      y:      y,
      width:  width,
      height: height,
    };

    return block;
  }

  function normalize (weightedMatrix, block) {
    if (!block.renderedWidth || !block.renderedHeight) {return;}

    var height = block.renderedHeight,
        width = block.renderedWidth,
        x, y, cell, weight;

    for (y = block.y; y < block.y+height; y++) {
      for (x = block.x; x < block.x+width; x++) {
        weightedMatrix[y][x] = [0, 0];
      }
    }

    // Reweight column
    for (y = block.y; y < height + block.y; y++) {
        weight = 0;
        for (x = block.x-1; x >= 0; x--) {
            cell = weightedMatrix[y][x];

            if (cell[0] === 0 && cell[1] === 0) {
              break;
            } else {
              weight++;
            }

            cell[0] = weight;
        }
    }

    // Reweight row
    for (x = block.x; x < width + block.x; x++) {
        weight = 0;
        for (y = block.y-1; y >= 0; y--) {
            cell = weightedMatrix[y][x];

            if (cell[0] === 0 && cell[1] === 0) {
              break;
            } else {
              weight++;
            }

            cell[1] = weight;
        }
    }
  }

  ////////////////////// Private Functions

  function _getMaxWeightedCell (weightedMatrix) {
    var maxWeight = 0,
        cell = {},
        weight;

    for (var y = 0; y < weightedMatrix.length; y++) {
      for (var x = 0; x < weightedMatrix[y].length; x++) {
        weight = weightedMatrix[y][x][0] * weightedMatrix[y][x][1];
        if (weight > maxWeight) {
          maxWeight = weight;
          cell = {
            x: x,
            y: y,
            colWeight: weightedMatrix[y][x][0],
            rowWeight: weightedMatrix[y][x][1],
          };
        }
      }
    }

    if (maxWeight === 0) {return false;}

    return cell;
  }
  //////////////////////

  return {
    init:        init,
    weighMatrix: weighMatrix,
    getBlock:    getBlock,
    normalize:   normalize
  };
})(FaceWord || {});

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

FaceWord.WordManager = (function () {
  var wordPool = [],
      wordIter;

  function init (text) {
    wordPool = _generateWordPool(text);
    wordIter = 0;
  }

  function getWord () {
    var index = wordIter - (wordPool.length * Math.floor(wordIter / wordPool.length)),
        word = wordPool[index].word;

    wordIter++;

    return word.toUpperCase();
  }

  ///////////////// Private Functions

  function _generateWordPool (text) {
    var wordPool  = [],
        wordArray = text.match(/[A-z]+/g),
        stopWords = [
          "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r",
          "s", "t", "u", "v", "w", "x", "y", "z",
          "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an",
          "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot",
          "could", "dear", "did", "do", "don", "does", "either", "else", "ever", "every", "for", "from",
          "get", "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however",
          "i", "if", "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely",
          "may", "me", "might", "most", "must", "my", "neither", "no", "nor", "not", "of", "off",
          "often", "on", "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she",
          "should", "since", "so", "some", "than", "that", "the", "their", "them", "then", "there",
          "these", "they", "this", "tis", "to", "too", "twas", "us", "wants", "was", "we", "were",
          "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would",
          "yet", "you", "your", "ain't", "aren't", "can't", "could've", "couldn't", "didn't", "doesn't",
          "don't", "hasn't", "he'd", "he'll", "he's", "how'd", "how'll", "how's", "i'd", "i'll",
          "i'm", "i've", "isn't", "it's", "might've", "mightn't", "must've", "mustn't", "shan't",
          "she'd", "she'll", "she's", "should've", "shouldn't", "that'll", "that's", "there's",
          "they'd", "they'll", "they're", "they've", "wasn't", "we'd", "we'll", "we're", "weren't",
          "what'd", "what's", "when'd", "when'll", "when's", "where'd", "where'll", "where's", "who'd",
          "who'll", "who's", "why'd", "why'll", "why's", "won't", "would've", "wouldn't", "you'd",
          "you'll", "you're", "you've", "very"
        ];

    wordArray.forEach(function(word){
      word = word.toLowerCase();
      if (stopWords.indexOf(word) === -1) {
        var found = false;
        for (var i = 0; i < wordPool.length; i++) {
          if (wordPool[i].word === word) {
            wordPool[i].occurence++;
            found = true;
            break;
          }
        }

        if (!found) {
          wordPool.push({
            word:word,
            occurence: 1
          });
        }
      }
    });

    wordPool.sort(function (a, b) {
      return b.occurence - a.occurence;
    });

    if (wordPool.length === 0) {
      throw new Error('Cannot parse text');
    }

    return wordPool;
  }

  /////////////////

  return {
    init: init,
    getWord: getWord
  };
})(FaceWord || {});
