FaceWord.WordManager = (function (FaceWord) {
  var wordPool;

  function init (text) {
    _generateWordPool(text);
  }

  function getWord () {
    var word = wordPool[Math.floor(Math.random()*wordPool.length)];

    if (word.length >= 4 && word.length <=6)
        return word.toUpperCase();

    return getWord();
  }

  /////////////////

  function _generateWordPool (text) {
    wordPool = text.match(/[A-z]+/g);
  }

  /////////////////

  return {
    init: init,
    getWord: getWord
  };
})(FaceWord || {});
