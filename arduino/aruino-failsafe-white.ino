#include "Adafruit_WS2801.h"
#include "SPI.h" // Comment out this line if using Trinket or Gemma
#ifdef __AVR_ATtiny85__
#include <avr/power.h>
#endif


// Choose which 2 pins you will use for output.
// Can be any valid output pins.
// The colors of the wires may be totally different so
// BE SURE TO CHECK YOUR PIXELS TO SEE WHICH WIRES TO USE!
uint8_t dataPin  = 2;    // Yellow wire on Adafruit Pixels
uint8_t clockPin = 3;    // Green wire on Adafruit Pixels

// Set the first variable to the NUMBER of pixels. 25 = 25 pixels in a row
Adafruit_WS2801 strip = Adafruit_WS2801(20, dataPin, clockPin, WS2801_GRB);

// custom
uint32_t color;

//start recvWithStartEndMarkers chars
const byte numChars = 200;
char receivedChars[numChars];
boolean newData = false;
//end recvWithStartEndMarkers chars


void setup() {
// setup code
#if defined(__AVR_ATtiny85__) && (F_CPU == 16000000L)
    clock_prescale_set(clock_div_1); // Enable 16 MHz on Trinket
#endif

    // start listening on port
    Serial.begin(9600);
    Serial.println("<Arduino is ready>");
    
    // initialize the first color
    color = Color(0, 255, 255);

    strip.begin();

    // Update LED contents, to start they are all 'off'
    strip.show();
    
    // show initialization effect
    initializeEffect();
}


void loop() {
    recvWithStartEndMarkers();
    reactToData();
    colorWipe(color);
    //delay(10);
}




