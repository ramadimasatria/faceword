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

    // weight row from right to left
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

    // weight column from bottom to top
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

            if (cell[0] !== 0 && cell[1] !== 0 ) {
              weightedMatrix.weights.push({
                x:x,
                y:y,
                rowWeight: cell[1],
                colWeight: cell[0],
              });
            }
        }
    }

    return weightedMatrix;
  };

  var generateBlocks = function (observedValue) {
    var weightedMatrix = weighMatrix(observedValue);
    
    weightedMatrix.weights.sort(compareWeight); // Sort by weight
    for (var i = 0; i < weightedMatrix.weights.length; i++) {
      var cell = weightedMatrix.weights[i];
      var block = getBlock(weightedMatrix.matrix, cell, observedValue);

      if (!examineBlock(weightedMatrix.matrix, block) && i > 0) {
        // Block is not valid, re-weigh the matrix and compute again
        generateBlocks(observedValue);
        break;
      } else {
        blocks.push(block);
      }
    }
  };

  var getBlock = function (matrix, cell, observedValue) {
    var block = {},
        x     = cell.x,
        y     = cell.y,
        width, height, i,
        adjacentCell;

    // width is the same as column width
    width = cell.colWeight;

    // find height
    height = 1;
    i = 1;
    while(i>0 && i+y<cell.rowWeight){
      try{
        adjacentCell = matrix[y+i][x];
      }catch(e){
        i=0;
      }

      if (adjacentCell && cell.colWeight <= adjacentCell[0]) {
        height++;
        i++;
      } else {
        i=0;
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

    normalize(matrix, block);

    return block;
  };

  var examineBlock = function (matrix, block) {
    for (var y = block.y; y < block.y+block.height; y++) {
      for (var x = block.x; x < block.x+block.width; x++) {
        if (matrix[x][y][0] === 0 || matrix[x][y][1] === 0)
          return false;
      }
    }

    return true;
  };

  var normalize = function (weightedMatrix, block) {
    for (var y = block.y; y < block.y+block.height; y++) {
      for (var x = block.x; x < block.x+block.width; x++) {
        weightedMatrix[y][x] = [0, 0];
        matrix.data[y][x]    = 'X';
      }
    }
  };

  var compareWeight = function (a, b) {
    var val1, val2;
    val1 = a.colWeight * a.rowWeight;
    val2 = b.colWeight * b.rowWeight;
    return val2 - val1;
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
