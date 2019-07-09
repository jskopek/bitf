const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

const flatSingle = arr => [].concat(...arr);


class ArduinoPanelManager {
    /* responsible for connecting to the LED controller and sending commands. Commands should be sent to an Arduino
     * via the serial port */
    constructor(path, baudRate) {
        this.opened = false
        this.port = undefined;
        this.parser = undefined;

        this.connect(path, baudRate);
    }

    connect(path, baudRate) {
        this.path = path;
        this.baudRate = baudRate;

        this.port = new SerialPort(this.path, { baudRate: this.baudRate });
        this.parser = new Readline();
        this.port.pipe(this.parser);

        //this.parser.on('data', line => console.log(`received data > ${line}`))
        this.port.write('LED CONTROLLER ON\n')


        this.port.on('error', function(err) {
            console.log('Error: ', err.message)
        })
        this.port.on('open', function(err) {
            console.log('Port opened!')
            this.opened = true;
        })

    }
    send(ledMatrix) {
        /* send an array of [r,g,b] values to the LEDs */
        var ledArray = flatSingle(ledMatrix)
        let ledArrayString = ledArray.map(rgbArray => rgbArray.join(',')).join(';');

        let command = `<${ledArrayString}>`
        
        if(this.opened) {
            this.port.write(command, (err) => {
                if(err) { console.log(`error sending data through port baudRate: ${this.baudRate} command: ${command}`); }
                console.log(`sent command: ${command}`);
            });
        } else {
            console.log(`not connected to LEDController; simulating command: ${command}`);
        }
    }
}

module.exports = ArduinoPanelManager
