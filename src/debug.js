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
    }
  };
})(FaceWord || {});
