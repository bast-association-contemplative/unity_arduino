const int AccelerationPin = 8;
const int fan = 9;

int buttonState = 0;

const int lf = 10;
char data[20];

void setup(){
  pinMode(fan, OUTPUT);
  pinMode(AccelerationPin, INPUT);
  
  Serial.begin(9600);
}

void loop(){
  
  Acceleration();
  
  Serial.readBytesUntil(lf, data, 3);
  String a = String(data);
  int fan_data = a.toInt();
  fan_data = map(fan_data, 0, 160, 0, 255);
  
  analogWrite(fan, fan_data);
  
  //Serial.println(a);
  delay(10);
}

void Acceleration(){

  buttonState = digitalRead(AccelerationPin);
  
  if (buttonState == HIGH) {     
    Serial.write(1);
    Serial.flush();
  } else {
  
  }
}
