// send ceiling render updates to viewer
class Panel {
    /* The remote LED controller (e.g. a Raspberry PI) */
    constructor(url, offsetRow, offsetCol) {
        this.url = url
        this.rows = 5; /* hardcoded for now */
        this.cols = 5; /* hardcoded for now */
        this.offsetRow = offsetRow;
        this.offsetCol = offsetCol;
    }
    send(colors) {
        fetch(this.url + '/push/?colors=' + encodeURIComponent(JSON.stringify(colors)));
    }
}

class PanelManager {
    constructor() {
        this.panels = [];
    }
    add(panel) {
        this.panels.push(panel);
    }
    send(ceiling) {
        this.panels.forEach((panel) => {
            var panelColors = this.getPartialCeilingColors(ceiling, panel.offsetRow, panel.offsetCol, panel.rows, panel.cols);
            panel.send(panelColors);
        });
    }
    getPartialCeilingColors(ceiling, panelOffsetRow, panelOffsetCol, panelRows, panelCols) {
        var colors = [];
        for(var iRow = panelOffsetRow; iRow < panelRows + panelOffsetRow; iRow++) {
            for(var iCol = panelOffsetCol; iCol < panelCols + panelOffsetCol; iCol++) {
                colors.push(ceiling.leds[iRow][iCol].colorStr());
            }
        }
        return colors;
    }
}

module.exports = {Panel, PanelManager}
