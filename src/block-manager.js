FaceWord.BlockManager = (function (FaceWord) {
  var matrix = {},
      blocks = [],
      valueMap;

  var weighMatrix = function (observedValue) {
    var data           = matrix.data,
        rows           = data.length,
        columns        = data[0].length,
        weightedMatrix = {
          matrix: [],
          weights: []
        };

    var value, weight, x, y, cell;

    // weight column from right to left
    for (y = 0; y < rows; y++) {
        weight = 0;
        weightedMatrix.matrix[y] = [];

        for (x = columns-1; x >= 0; x--) {
            value = data[y][x];

            if (value === observedValue) {
              weight++;
            } else {
              weight = 0;
            }

            weightedMatrix.matrix[y][x] = [weight];
        }
    }

    // weight row from bottom to top
    for (x = 0; x < columns; x++) {
        weight = 0;
        for (y = rows-1; y >= 0; y--) {
            value = data[y][x];
            cell  = weightedMatrix.matrix[y][x];

            if (value === observedValue) {
              weight++;
            } else {
              weight = 0;
            }

            cell[1] = weight;
        }
    }

    return weightedMatrix;
  };

  var generateBlocks = function (observedValue, weightedMatrix) {
    var cell, block;
    
    weightedMatrix = weightedMatrix ? weightedMatrix : weighMatrix(observedValue);

    cell = getMaxWeight(weightedMatrix.matrix);
    if (!cell) return;

    block = getBlock(weightedMatrix.matrix, cell, observedValue);
    blocks.push(block);

    generateBlocks(observedValue, weightedMatrix);
  };

  var getBlock = function (matrix, cell, observedValue) {
    var block   = {},
        x       = cell.x,
        y       = cell.y,
        maxArea, prevWidth, width, height, i,
        adjacentCell;

    maxArea = 0;
    prevWidth = cell.colWeight;
    for (var row = 0; row < cell.rowWeight; row++) {
      var observedCell = matrix[y+row][x],
          observedArea;

      width = Math.min(prevWidth, observedCell[0]);
      height = row+1;
      observedArea = width * height;

      if (observedArea >= maxArea) {
        maxArea = observedArea;
        prevWidth = width;
      } else {
        height = row;
        break;
      }
    }

    block = {
      x:      x,
      y:      y,
      width:  width,
      height: height,
      value:  observedValue,
      color:  valueMap[observedValue]
    };

    normalize(matrix, block, observedValue);

    return block;
  };

  var normalize = function (weightedMatrix, block, observedValue) {
    var x, y, weight;

    for (y = block.y; y < block.y+block.height; y++) {
      for (x = block.x; x < block.x+block.width; x++) {
        weightedMatrix[y][x] = [0, 0];
        matrix.data[y][x]    = 'X';
      }
    }

    // Reweight column
    for (y = block.y; y < block.height + block.y; y++) {
        weight = 0;
        for (x = block.x-1; x >= 0; x--) {
            value = matrix.data[y][x];

            if (value === observedValue) {
              weight++;
            } else {
              break;
            }

            weightedMatrix[y][x][0] = weight;
        }
    }

    // Reweight row
    for (x = block.x; x < block.width + block.x; x++) {
        weight = 0;
        for (y = block.y-1; y >= 0; y--) {
            value = matrix.data[y][x];

            if (value === observedValue) {
              weight++;
            } else {
              break;
            }

            weightedMatrix[y][x][1] = weight;
        }
    }

    // FaceWord.Debug.printMatrix(weightedMatrix, '#weighted');
  };

  var compareWeight = function (a, b) {
    var val1, val2;
    val1 = a.colWeight * a.rowWeight;
    val2 = b.colWeight * b.rowWeight;
    return val2 - val1;
  };

  var getMaxWeight = function (matrix) {
    var maxWeight = 0,
        cell = {},
        weight;

    for (var y = 0; y < matrix.length; y++) {
      for (var x = 0; x < matrix[y].length; x++) {
        weight = matrix[y][x][0] * matrix[y][x][1];
        if (weight > maxWeight) {
          maxWeight = weight;
          cell = {
            x: x,
            y: y,
            colWeight: matrix[y][x][0],
            rowWeight: matrix[y][x][1],
          };
        }
      }
    }

    if (maxWeight === 0) return false;

    return cell;
  };

  return {
    generateBlocks: function (mtx) {
      matrix = mtx;
      valueMap = mtx.valueMap;

      if (valueMap.length < 2)
        console.log('Require 2 color or more..');

      for (var i = 1; i < valueMap.length; i++) {
        // Start generating block from value 1 (0 is for background)
        generateBlocks(i);
      }

      return blocks;
    }
  };
})(FaceWord || {});
