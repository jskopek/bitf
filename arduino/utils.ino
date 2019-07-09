void initializeEffect() {
    // "I'm alive!" light sequence
    colorWipe(Color(255,0,0));
    delay(400);
    colorWipe(Color(0,255,0));
    delay(400);
    colorWipe(Color(0,0,255));
    delay(400);
}

void reactToData() {
  if (newData == true) {
    Serial.print("reactToData ... ");
    Serial.println(receivedChars);
    
    const char delimiter[4] = ";";
    char* lightData;
    
    // get the first light data
    lightData = strtok(receivedChars, delimiter);
    
    // loop through each light
    while(lightData != 0) {
      color = stringToColor(lightData);

      // go through other lights
      lightData = strtok(0, delimiter);
    }
    
    newData = false;
  }
}



/* Helper functions */

// fill the dots one after the other with said color
// good for testing purposes
void colorWipe(uint32_t c) {
    int i;

    for (i=0; i < strip.numPixels(); i++) {
        strip.setPixelColor(i, c);
        strip.show();
    }
}

// Create a 24 bit color value from R,G,B
uint32_t Color(byte r, byte g, byte b)
{
    uint32_t c;
    c = r;
    c <<= 8;
    c |= g;
    c <<= 8;
    c |= b;
    return c;
}


void recvWithStartEndMarkers() {
    static boolean recvInProgress = false;
    static byte ndx = 0;
    char startMarker = '<';
    char endMarker = '>';
    char rc;
 
    while (Serial.available() > 0 && newData == false) {
        rc = Serial.read();

        if (recvInProgress == true) {
            if (rc != endMarker) {
                receivedChars[ndx] = rc;
                ndx++;
                if (ndx >= numChars) {
                    ndx = numChars - 1;
                }
            }
            else {
                receivedChars[ndx] = '\0'; // terminate the string
                recvInProgress = false;
                ndx = 0;
                newData = true;
            }
        }

        else if (rc == startMarker) {
            recvInProgress = true;
        }
    }
}



uint32_t stringToColor(char* red) {
    // takes a char* string with "int,int,int" format, where int is a number from 0-255
    // that represents red, green, and blue
    // returns a uint32_t color string
    const char ch = ',';
    char *green = strchr(red, ch);
    *green = 0; // split red from rest
    green++;


    char *blue = strchr(green, ch);
    *blue = 0; // split green from rest
    blue++;


    printf("Red: %s \n", red);
    printf("Green: %s \n", green);
    printf("Blue: %s \n", blue);
    printf("\n\n");

    uint32_t color = Color(atoi(red), atoi(green), atoi(blue)); 
    return color;
}


