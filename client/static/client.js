class Visualizer {
    constructor(canvas, cols, rows, colors) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.cols = cols;
        this.rows = rows;
        this.colors = colors || [];

        this.resizeCanvas();
    }
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.drawPixels();
    }
    setColors(colors) {
        this.colors = colors;
        this.drawPixels();
    }
    drawPixels() {
        var minDimension = this.canvas.width < this.canvas.height ? this.canvas.width : this.canvas.height;
        var maxTable = this.cols < this.rows ? this.rows : this.cols;

        var cellSize = minDimension / maxTable;

        var colorIndex = 0;
        for(var r = 0; r < this.rows; r++) {
            for(var c = 0; c < this.cols; c++) {
                this.ctx.fillStyle = this.colors[colorIndex] || 'red';
                colorIndex++;

                var x = c * cellSize;
                var y = r * cellSize;
                this.ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
            }
        }
    }
}

var canvas = document.querySelector('canvas');
var visualizer = new Visualizer(canvas, 5, 5);

window.addEventListener('resize', () => { visualizer.resizeCanvas(); });

var socket = io();
socket.on('colors', (colors) => { console.log('colors', colors); visualizer.setColors(colors); });
