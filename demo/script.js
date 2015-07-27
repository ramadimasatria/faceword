var input = [
    [1,1,0,1,0,0,0,1,0],
    [1,1,0,1,1,1,0,0,0],
    [0,1,1,1,0,0,0,1,1],
    [1,0,0,0,1,0,0,1,0]
];
var canvasMultiplier = 50;
var text = 'Here’s to the crazy ones. The misfits. The rebels. The troublemakers. The round pegs in the square holes. The ones who see things differently. They’re not fond of rules. And they have no respect for the status quo. You can quote them, disagree with them, glorify or vilify them. About the only thing you can’t do is ignore them. Because they change things. They invent. They imagine. They heal. They explore. They create. They inspire. They push the human race forward. Maybe they have to be crazy.How else can you stare at an empty canvas and see a work of art? Or sit in silence and hear a song that’s never been written? Or gaze at a red planet and see a laboratory on wheels? We make tools for these kinds of people. While some see them as the crazy ones, we see genius. Because the people who are crazy enough to think they can change the world, are the ones who do.';

printMatrix (input, '#input', 'Input');

var textPool = generateTextPool(text);
var weighed = weighMatrix(input);
var blocks = generateBlocks(weighed);

////////////////////////////////////////////////////

function generateTextPool (text) {
    var textPool = text.match(/[A-z]+/g);

    return textPool;
}

function getText () {
    var text = textPool[Math.floor(Math.random()*textPool.length)];

    if (text.length >= 5)
        return text;
    
    return getText();
}

function weighMatrix (matrix) {
    var weighedMatrix = [],
        rows = matrix.length,
        columns = matrix[0].length;

    var value, weight, x, y;

    // weight row from right to left
    for (x = 0; x < rows; x++) {
        weight = 0;
        weighedMatrix[x] = [];

        for (y = columns-1; y >= 0; y--) {
            value = matrix[x][y];

            if (value === 0)
                weight = 0;
            if (value === 1)
                weight++;

            weighedMatrix[x][y] = [weight];
        }
    }
    
    // weight column from bottom to top
    for (y = 0; y < columns; y++) {
        weight = 0;
        for (x = rows-1; x >= 0; x--) {
            value = matrix[x][y];

            if (value === 0)
                weight = 0;
            if (value === 1)
                weight++;

            weighedMatrix[x][y][1] = weight;
        }
    }

    printMatrix(weighedMatrix, '#weighed', 'Weighed Matrix');
    return weighedMatrix;
}

function generateBlocks (weighedMatrix) {
    var blocks = [],
        block,
        weight;

    for (var x = 0; x < weighedMatrix.length; x++) {
        for (var y = 0; y < weighedMatrix[x].length; y++) {
            weight = weighedMatrix[x][y];
            if (weight[0] === 0 || weight[1] === 0)
                continue;

            block = findBlock(weighedMatrix, x, y);
            normalizeBlock(weighedMatrix, block);
            blocks.push(block);
        }
    }

    renderBlocks(blocks, '#blocks', 'Blocks');
    return blocks;
}

function findBlock (matrix, x, y) {
    var value = matrix[x][y],
        block = {},
        width, height, i,
        adjacentCell;

    // width is the same as column width
    width = value[0];

    // find height
    height = 1;
    i = 1;
    while(i>0){
        try{
            adjacentCell = matrix[x+i][y];
        }catch(e){
            i=0;
        }

        if (adjacentCell && value[0] <= adjacentCell[0]) {
            height++;
            i++;
        } else {
            i=0;
        }
    }

    block = {
        x: x,
        y: y,
        width: width,
        height: height
    };


    return block;
}

function normalizeBlock (weighedMatrix, block) {
    for (var x = block.x; x < block.x+block.height; x++) {
        for (var y = block.y; y < block.y+block.width; y++) {
            console.log('normalize cell '+x+', '+y);
            weighedMatrix[x][y] = [0, 0];
        }
    }
}

function renderText (block, ctx) {
    var text = getText(),
        x = block.x,
        y = block.y,
        width = block.width,
        height = block.height,
        fontSize,
        fontOffset;

    fontSize = measureFontSize(text, ctx, width, height);
    fontHeight = fontSize * 0.7;

    ctx.font = fontSize + 'px serif';
    ctx.fillText(text, y, x+fontHeight, width);

    // Run the function again if there's an extra space
    var extraHeight = height - fontHeight,
        extraBlock;

    if (extraHeight > 10) {
        extraBlock = {
            x: block.x + fontHeight + 2, // add some extra pixel
            y: block.y,
            width: block.width,
            height: extraHeight
        };
        renderText(extraBlock, ctx);
    }


    // Return optimal font size
    function measureFontSize (text, ctx, maxWidth, maxHeight) {
        var size = 4,
            wDiff,
            textWidth;

        ctx.font = size + 'px serif';
        textWidth = ctx.measureText(text).width;
        wDiff = maxWidth - textWidth;

        if (wDiff < 0) {
            return size;
        }

        while(wDiff > 0){
            size += 2;
            ctx.font = size + 'px serif';
            textWidth = ctx.measureText(text).width;
            wDiff = maxWidth - textWidth;
        }

        return size - 2;
    }
}

///////////////////////////////////////////////

function printMatrix (matrix, selector, title) {
    var el = document.querySelector(selector);
    var context = '';

    if (title)
        context += '<h3>'+title+'</h3>';

    context += '<table border=1>';

    for (var i = 0; i < matrix.length; i++) {
        context += '<tr>';

        for (var j = 0; j < matrix[i].length; j++) {
            context += '<td>'+matrix[i][j]+'</td>';
        }

        context += '</tr>';
    }

    context += '</table>';

    el.innerHTML = context;
}

function renderBlocks (blocks, selector, title) {
    var el = document.querySelector(selector);

    var canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;

    var ctx = canvas.getContext('2d');

    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        var multipliedBlock = {
            x: block.x * canvasMultiplier,
            y: block.y * canvasMultiplier,
            width: block.width * canvasMultiplier,
            height: block.height * canvasMultiplier
        };

        renderText(multipliedBlock, ctx);
    }


    if (title)
        el.innerHTML = '<h3>'+title+'</h3>';
    el.appendChild(canvas);
}