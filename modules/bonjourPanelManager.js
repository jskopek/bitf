const EventEmitter = require( 'events' );
var bonjour = require('bonjour')();
const fetch = require('node-fetch');
var { valuesToMatrix } = require('../static/utils.js');

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

function getPartialCeilingColors(colorMatrix, panelOffsetRow, panelOffsetCol, panelRows, panelCols) {
    var colors = [];
    for(var iRow = panelOffsetRow; iRow < panelRows + panelOffsetRow; iRow++) {
        for(var iCol = panelOffsetCol; iCol < panelCols + panelOffsetCol; iCol++) {
            var rgbArray = colorMatrix[iRow][iCol];
            try {
                var rgbString = `rgb(${rgbArray[0]},${rgbArray[1]},${rgbArray[2]})`
                colors.push(rgbString);
            }  catch(err) {
                console.error(`getPartialCeilingColors does not have data for row:${iRow} col:${iCol}; is the panel correctly configured?`)
            }
        }
    }
    return colors;
}

class BonjourPanelManager extends EventEmitter {
    // monitor for new panels being broadcast on bonjour
    // when new panel is detected, add to this.panels array
    // if socket is passed, emit a 'panel' event when new panel is found
    constructor(rows, cols) {
        super();

        // store the number of rows and cols in the ceiling; used to determine colors for each panel based on panels offsetRow and offsetCol values
        this.rows = rows;
        this.cols = cols; 

        console.log('Listening for panels');
        this.bonjourPanels = [];

        var browser = bonjour.find({type: 'panel'}, (service) => {
            var panelData = {
                'address': service.referer.address,
                'port': service.port,
                'offsetRow': parseInt(service.txt.offsetrow) || 0,
                'offsetCol': parseInt(service.txt.offsetcol) || 0
            };

            console.log('Found Panel!', panelData);

            var bonjourPanel = new BonjourPanel(`http://${panelData.address}:${panelData.port}`, panelData.offsetRow, panelData.offsetCol)
            this.bonjourPanels.push(bonjourPanel);

            this.emit('new', panelData); 
        });
        console.log('Listening for panels');
    }
    add(bonjourPanel) {
        this.bonjourPanels.push(bonjourPanel);
    }
    send(panelColorsArray) {
        // convert the array of color arrays to a multi-dimensional matrix
        var colorMatrix = valuesToMatrix(panelColorsArray, this.rows, this.cols);

        this.bonjourPanels.forEach((bonjourPanel) => {
            var panelColors = getPartialCeilingColors(colorMatrix, bonjourPanel.offsetRow, bonjourPanel.offsetCol, bonjourPanel.rows, bonjourPanel.cols);
            console.log('BonjourPanelManager.send', panelColorsArray, panelColors);
            bonjourPanel.send(panelColors);
        });
    }

}

module.exports = {BonjourPanelManager, BonjourPanel}
