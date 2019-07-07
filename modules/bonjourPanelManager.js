class BonjourPanelManager {
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

module.exports = BonjourPanelManager
