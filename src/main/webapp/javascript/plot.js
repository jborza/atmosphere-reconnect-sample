var last_y = 0;

function create_initial_plot() {
    var canvas = document.getElementById('canvas');
    if (!canvas.getContext)
        return;
    var ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width - 1, canvas.height / 2);
    ctx.stroke();
}

function shift() {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    // shift everything to the left:
    var imageData = context.getImageData(1, 0, context.canvas.width - 1, context.canvas.height);
    context.putImageData(imageData, 0, 0);
    // now clear the right-most pixels:
    context.clearRect(context.canvas.width - 1, 0, 1, context.canvas.height);
}

function addPoint(value) {
    //value is from 0 to 1, multiply by canvas height to scale
    var canvas = document.getElementById('canvas');

    var height = canvas.height;
    var y = height * value;

    var ctx = canvas.getContext('2d');
    var saturation = 60+value*20;
    ctx.strokeStyle='hsl('+30*value+','+saturation+'%,50%)';
    ctx.beginPath();
    ctx.moveTo(canvas.width - 2, last_y);
    ctx.lineTo(canvas.width - 1, y);
    ctx.stroke();
    last_y = y;
}

function addRandomPoint() {
    shift();
    addPoint(Math.random());
}