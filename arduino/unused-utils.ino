
void showNewData() {
    if (newData == true) {
        Serial.print("This just in ... ");
        Serial.println(receivedChars);
        newData = false;
    }
}



//int readline(int readch, char *buffer, int len) {
//    // source: https://majenko.co.uk/blog/reading-serial-arduino
//    static int pos = 0;
//    int rpos;
//
//    if (readch > 0) {
//        switch (readch) {
//            case '\r': // Ignore CR
//                break;
//            case '\n': // Return on new-line
//                rpos = pos;
//                pos = 0;  // Reset position index ready for next time
//                return rpos;
//            default:
//                if (pos < len-1) {
//                    buffer[pos++] = readch;
//                    buffer[pos] = 0;
//                }
//        }
//    }
//    return 0;
//}



void handleSerial() {
    while (Serial.available() > 0) {
        char incomingCharacter = Serial.read();
        switch (incomingCharacter) {
            case 'a':
                color = Color(255, 0, 0);
                break;
            case 'b':
                color = Color(0, 255, 0);
                break;
            case 'c':
                color = Color(0, 0, 255);
        }
    }
}


