FaceWord.WordManager = (function (FaceWord) {
  var wordPool;

  var generateWordPool = function (text) {
    wordPool = text.match(/[A-z]+/g);
  };

  var getRandomWord = function () {
    var word = wordPool[Math.floor(Math.random()*wordPool.length)];

    if (word.length >= 4 && word.length <=6)
        return word.toUpperCase();
    
    return getRandomWord();
  };

  return {
    init: function (text) {
      generateWordPool(text);
    },
    getRandomWord: getRandomWord
  };
})(FaceWord || {});
