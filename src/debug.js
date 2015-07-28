FaceWord.Debug = (function (FaceWord) {
  return {
    printMatrix: function (data, container) {
      var el = document.querySelector(container),
          context = '';

      context += '<table style="font-size:8px">';
      for (var i = 0; i < data.length; i++) {
        context += '<tr>';
        for (var j = 0; j < data[i].length; j++) {
          context += '<td>'+data[i][j]+'</td>';
        }

        context += '</tr>';
      }
      context += '</table>';

      el.innerHTML = context;
    },

    drawImageData: function (imageData, selector) {
      var ctx = document.querySelector(selector).getContext('2d');

      ctx.putImageData(imageData, 0, 0);
    },

    drawPixelatedImage: function (pixelated, blockSize, selector) {
      var ctx = document.querySelector(selector).getContext('2d');
      for (var y = 0; y < pixelated.length; y++) {
        for (var x = 0; x < pixelated[y].length; x++) {
          var value = pixelated[y][x];
          var block = {
            x: x*blockSize,
            y: y*blockSize,
            width: blockSize,
            height: blockSize
          };
  
          ctx.fillStyle = 'rgb('+value+','+value+','+value+')';
          ctx.fillRect(block.x, block.y, block.width, block.height);
        }
      }
    }
  };
})(FaceWord || {});
