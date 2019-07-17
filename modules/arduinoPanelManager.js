const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
var { duplicateValues, flattenMatrixOnce } = require('../static/utils.js');


class ArduinoPanelManager {
    /* responsible for connecting to the LED controller and sending commands. Commands should be sent to an Arduino
     * via the serial port */
    constructor(options) {
        this.options = Object.assign({
            'path': '/dev/ttyS3',
            'baudRate': 9600,
            'ledsPerPanel': 2
        }, options);

        this.opened = false
        this.port = undefined;
        this.parser = undefined;

        this.connect(this.options.path, this.options.baudRate);
    }

    connect(path, baudRate) {
        this.port = new SerialPort(path, { baudRate: baudRate });
        this.parser = new Readline();
        this.port.pipe(this.parser);

        //this.parser.on('data', line => console.log(`received data > ${line}`))
        this.port.write('LED CONTROLLER ON\n')


        this.port.on('error', (err) => {
            console.log('Error: ', err.message)
        })
        this.port.on('open', (err) => {
            console.log('Port opened!')
            this.opened = true;
        })

    }
    send(panelColorsArray) {
        // duplicate the colors by this.options.ledsPerPanel times; creates value for each LED in panel
        let ledColorsArray = duplicateValues(panelColorsArray, this.options.ledsPerPanel);

        // generate LED string
        let ledArrayString = ledColorsArray.map(rgbArray => rgbArray.join(',')).join(';');

        let command = `<${ledArrayString}>`
        
        if(this.opened) {
            this.port.write(command, (err) => {
                if(err) { console.log(`error sending data through port baudRate: ${this.options.baudRate} command: ${command}`); }
                console.log(`sent command: ${command}`);
            });
        } else {
            console.log(`not connected to LEDController; simulating command: ${command}`);
        }
    }
}

module.exports = ArduinoPanelManager
