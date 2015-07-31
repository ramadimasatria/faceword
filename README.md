# Faceword

Faceword is a javascript module to convert image to word cloud with no external dependencies.
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
var img = image,             // Input image element
    text = 'blah blah blah', // Text to render
    canvas = '#canvas';      // Output canvas selector

FaceWord.init(img, text, canvas);
FaceWord.run();
```
