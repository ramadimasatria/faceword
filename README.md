# Faceword

Faceword is a javascript module to generate word cloud from given text & image.
[See it in action](http://rdsatria.com/faceword).

## How To Use

### Installation

Install the package with bower.

```sh
bower install faceword
```

Add FaceWord.js to your project

```sh
<script src="faceword/dist/FaceWord.js"></script>
```

### Using The Module

```sh
var img = image,             // Input element. Can be Image or Canvas element
    text = 'blah blah blah', // Text to render
    canvas = '#canvas';      // Output canvas selector
    settings = {}            // Settings object

FaceWord.run(img, text, canvas, settings);
```

### Default Settings
```sh
settings = {
    contrast:      0, 
    blockSize:     5,
    minFontSize:   2,
    maxFontSize:   48,
    imgMaxWidth:   600,
    fontFamily:    'serif',
    fontWeight:    400,
    colors:        8,
    inverse:       false,
    darkMode:      false,
}
```