const EventEmitter = require( 'events' );
var bonjour = require('bonjour')();
const fetch = require('node-fetch');

// send ceiling render updates to viewer
class BonjourPanel {
    /* The remote LED controller (e.g. a Raspberry PI) */
    constructor(url, offsetRow, offsetCol) {
        this.url = url
        this.rows = 2; /* hardcoded for now */
        this.cols = 4; /* hardcoded for now */
        this.offsetRow = offsetRow;
        this.offsetCol = offsetCol;
    }
    send(colors) {
        fetch(this.url + '/push/?colors=' + encodeURIComponent(JSON.stringify(colors)));
    }
}

class BonjourPanelManager extends EventEmitter {
    // monitor for new panels being broadcast on bonjour
    // when new panel is detected, add to this.panels array
    // if socket is passed, emit a 'panel' event when new panel is found
    constructor() {
        super();
        console.log('Listening for panels');
        this.panels = [];

        var browser = bonjour.find({type: 'panel'}, (service) => {
            var panelData = {
                'address': service.referer.address,
                'port': service.port,
                'offsetRow': parseInt(service.txt.offsetrow) || 0,
                'offsetCol': parseInt(service.txt.offsetcol) || 0
            };

            console.log('Found Panel!', panelData);

            var panel = new BonjourPanel(`http://${panelData.address}:${panelData.port}`, panelData.offsetRow, panelData.offsetCol)
            this.panels.push(panel);

            this.emit('new', panelData); 
        });
        console.log('Listening for panels');
    }
    add(panel) {
        this.panels.push(panel);
    }
    send(ledMatrix) {
        this.panels.forEach((panel) => {
            var panelColors = this.getPartialCeilingColors(ledMatrix, panel.offsetRow, panel.offsetCol, panel.rows, panel.cols);
            panel.send(panelColors);
        });
    }
    getPartialCeilingColors(ledMatrix, panelOffsetRow, panelOffsetCol, panelRows, panelCols) {
        var colors = [];
        for(var iRow = panelOffsetRow; iRow < panelRows + panelOffsetRow; iRow++) {
            for(var iCol = panelOffsetCol; iCol < panelCols + panelOffsetCol; iCol++) {
                var rgbArray = ledMatrix[iRow][iCol];
                try {
                    var rgbString = `rgb(${rgbArray[0]},${rgbArray[1]},${rgbArray[2]})`
                    console.log(rgbString);
                    colors.push(rgbString);
                }  catch(err) {
                    console.error(`getPartialCeilingColors does not have data for row:${iRow} col:${iCol}; is the panel correctly configured?`)
                }
            }
        }
        return colors;
    }
}

module.exports = {BonjourPanelManager, BonjourPanel}
