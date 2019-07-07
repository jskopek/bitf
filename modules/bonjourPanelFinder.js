var bonjour = require('bonjour')();

class BonjourPanelFinder {
    // monitor for new panels being broadcast on bonjour
    // when new panel is detected, add to this.panels array
    // if socket is passed, emit a 'panel' event when new panel is found
    constructor(socket) {
        console.log('Listening for panels');
        this.panels = [];
        this.socket = socket;

        var browser = bonjour.find({type: 'panel'}, (service) => {
            var panelData = {
                'address': service.referer.address,
                'port': service.port,
                'offsetRow': parseInt(service.txt.offsetrow) || 0,
                'offsetCol': parseInt(service.txt.offsetcol) || 0
            };
            this.panels.push(panelData);
            console.log('Found Panel!', panelData);
            if(this.socket) {
                this.socket.emit('panel', panelData); 
            }
        });
        console.log('Listening for panels');
    }
}

module.exports = BonjourPanelFinder;
