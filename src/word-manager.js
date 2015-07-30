FaceWord.WordManager = (function (FaceWord) {
  var wordPool = [],
      wordIter;

  function init (text) {
    wordPool = [];
    wordIter = 0;

    _generateWordPool(text);
  }

  function getWord () {
    var index = wordIter - (wordPool.length * Math.floor(wordIter / wordPool.length)),
        word = wordPool[index].word;

    wordIter++;

    return word.toUpperCase();
  }

  ///////////////// Private Functions

  function _generateWordPool (text) {
    var wordArray = text.match(/[A-z]+/g),
        stopWords = [
          "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r",
          "s", "t", "u", "v", "w", "x", "y", "z",
          "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an",
          "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot",
          "could", "dear", "did", "do", "does", "either", "else", "ever", "every", "for", "from",
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
          "you'll", "you're", "you've"
        ];

    wordArray.forEach(function(word, i){
      word = word.toLowerCase();
      if (stopWords.indexOf(word) === -1) {
        var found = false;
        for (var x = 0; x < wordPool.length; x++) {
          if (wordPool[x].word == word) {
            wordPool[x].occurence++;
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
  }

  /////////////////

  return {
    init: init,
    getWord: getWord
  };
})(FaceWord || {});
