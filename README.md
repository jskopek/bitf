# Starfield
## Burn in the Forest 2019

![Preview](preview.png)


This is the code for the Starfield project. There are two parts:

1. Arduino-based light controller: listens on port 9600 for sequences of light values and instructs the lights to change to those values
2. Computer-based light generator: generates a pattern of lights and sends to the light controller on the serial baud rate of 9600

# Arduino light controller

Code for this is in 'arduino' folder.

To run, simply plug in an Arduino into a USB port, open the Arduino editor, and upload the code.

You will need to wire your arduino to an Adafruit 36mm Square 12V Digital RGB Pixels strand with WS2801 controller

Example: https://www.adafruit.com/product/683

Wire the LED data pin to port 2 and clock pin to port 3 on the arduino

Four variants are provided:

- `starfield-arduino.ino`: Receives commands from the `controller.js` via the 9600 baud serial port
- `arduino-failsafe-white.ino`: Shows a static white light; does not require computer
- `arduino-failsafe-white-alt.ino`: Shows a static white light (alternative); does not require computer
- `arduino-failsafe-color.ino`: Shows a changing wheel of color; does not require computer

# Computer based light generator

Before you run this, you need to determine the arduino's COM port and set the `const path` to the proper port. See this guide for instructions on how to find the port: https://www.mathworks.com/help/supportpkg/arduinoio/ug/find-arduino-port-on-windows-mac-and-linux.html

The controller will send commands on the serial port with baud rate of 9600. It will send an 'a', 'b', or 'c' command at random every 100ms

To get this running, just run `npm install`, then `npm controller.js`

# Notes

If you want to compile to Arduino from the command line (e.g. editing in an IDE) you can do so by calling the arduino executable with the `--upload` and `--port` params. EG:

`arduino.exe --upload ~\starfield-arduino\starfield-arduino.ino --port COM3`


# TODO

TODO: animating between old and new values
TODO: two LEDs per ceiling
TODO: effects for two LEDs


