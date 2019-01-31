var Panel = require('./panel.js');

class Ceiling {
    constructor(scene, rows, cols, size, gap, offsetX, offsetY, offsetZ) {
        this.scene = scene;
        this.rows = rows;
        this.cols = cols;
        this.size = size;
        this.gap = gap;
        this.panels = [];

        for(var row = 0; row < rows; row++) {
            var rowPanels = [];
            for(var col = 0; col < cols; col++) {
                var x = offsetX + col * (this.size + this.gap);
                var y = offsetY + row * (this.size + this.gap);
                var z = offsetZ;
                var panel = new Panel(this.scene, x, y, z, this.size - this.gap);
                rowPanels.push(panel);
            }
            this.panels.push(rowPanels);
        }
    }
    animate() {
//        _.each(this.panels, (row) => {
//            _.each(row, (panel) => {
//                panel.cube.rotation.y += 0.01;
//            });
//        });
    }
    load(values, playSpeed) {
        var i = 0;
        for(var row = 0; row < this.rows; row++) {
            for(var col = 0; col < this.cols; col++) {
                this.panels[row][col].load(values[i], playSpeed);
                i++;
            }
        }
    }

}


module.exports = Ceiling;
