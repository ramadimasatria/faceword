FaceWord.BlockManager = (function (FaceWord) {
  var matrix         = {},
      weightedMatrix = [];

  var weighMatrix = function () {
    var data    = matrix.data,
        rows    = data.length,
        columns = data[0].length;

    var value, weight, x, y;

    // weight row from right to left
    for (x = 0; x < rows; x++) {
        weight = 0;
        weightedMatrix[x] = [];

        for (y = columns-1; y >= 0; y--) {
            value = data[x][y];

            if (value === 0)
                weight = 0;
            if (value === 1)
                weight++;

            weightedMatrix[x][y] = [weight];
        }
    }

    // weight column from bottom to top
    for (y = 0; y < columns; y++) {
        weight = 0;
        for (x = rows-1; x >= 0; x--) {
            value = data[x][y];

            if (value === 0)
                weight = 0;
            if (value === 1)
                weight++;

            weightedMatrix[x][y][1] = weight;
        }
    }

    FaceWord.Debug.printMatrix(weightedMatrix, '#weighted');
  };

  var generateBlocks = function () {
  };

  return {
    init: function (mtx) {
      matrix = mtx;

      weighMatrix();
      generateBlocks();
    }
  };
})(FaceWord || {});
