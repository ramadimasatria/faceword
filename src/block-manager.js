FaceWord.BlockManager = (function (FaceWord) {
  function init () {
  }

  function weighMatrix (matrix, observedValue) {
    var rows           = matrix.length,
        columns        = matrix[0].length,
        weightedMatrix = [];

    var value, weight, x, y, cell;

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

    if (!cell) return false;

    x            = cell.x;
    y            = cell.y;
    maxArea      = 0;
    maxHeight    = Math.min(cell.rowWeight, Math.ceil(0.3*cell.colWeight));
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

  //////////////////////

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

    if (maxWeight === 0) return false;

    return cell;
  }
  //////////////////////

  return {
    init:        init,
    weighMatrix: weighMatrix,
    getBlock:    getBlock
  };
})(FaceWord || {});
