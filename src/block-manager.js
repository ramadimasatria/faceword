FaceWord.BlockManager = (function (FaceWord) {
  var settings;

  var cellIndex = 0,
      sortedCells = [];

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
    var cell,
        observedCell;

    if (cellIndex === sortedCells.length) {
      cellIndex = 0;
      _sortCells(weightedMatrix);

      if (sortedCells.length === 0) {
        return false;
      }
    }

    for (cellIndex; cellIndex < sortedCells.length; cellIndex++) {
      cell = sortedCells[cellIndex];
      observedCell = weightedMatrix[cell.y][cell.x];

      if (cell.colWeight === observedCell[0] && cell.rowWeight === observedCell[1]) {
        cellIndex++;
        break;
      }
    }

    return cell;
  }

  function _sortCells (weightedMatrix) {
    var cell;

    sortedCells = [];

    // Clone weighted matrix
    for (var y = 0; y < weightedMatrix.length; y++) {
      for (var x = 0; x < weightedMatrix[y].length; x++) {
        cell = {
          x: x,
          y: y,
          colWeight: weightedMatrix[y][x][0],
          rowWeight: weightedMatrix[y][x][1],
        };

        if (cell.colWeight && cell.rowWeight) {
          sortedCells.push(cell);
        }
      }
    }

    sortedCells.sort(function (a, b) {
      var weightA = a.colWeight * a.rowWeight,
          weightB = b.colWeight * b.rowWeight;

      return weightB - weightA;
    });
  }
  //////////////////////

  return {
    init:        init,
    weighMatrix: weighMatrix,
    getBlock:    getBlock,
    normalize:   normalize
  };
})(FaceWord || {});
