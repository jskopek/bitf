// send ceiling render updates to viewer
class BonjourPanel {
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

module.exports = BonjourPanel
