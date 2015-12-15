using UnityEngine;
using System.Collections;
using System.IO.Ports;

public class fanserial : MonoBehaviour {

	public float currentSpeed;
	public WheelCollider wheel;

	//WARGNING Write your SerialPort !!!
	public static SerialPort arduino_port = new SerialPort("/dev/tty.usbmodem1411", 9600);
	
	void Start () {
		OpenConnection();
	}

	void Update () {
		currentSpeed = 2 * 22 / 7 * wheel.radius * wheel.rpm * 60 / 1000;
		currentSpeed = Mathf.Round(currentSpeed);

		arduino_port.Write (currentSpeed.ToString());

		if (currentSpeed >= 0 && currentSpeed < 10) {
			Debug.Log("00" + currentSpeed);
			arduino_port.Write ("00" + currentSpeed.ToString());
		} else if (currentSpeed > 9 && currentSpeed < 100) {
			Debug.Log("0" + currentSpeed);
			arduino_port.Write ("0" + currentSpeed.ToString());
		} else if (currentSpeed < 0) {
			Debug.Log(-currentSpeed);
			arduino_port.Write (currentSpeed.ToString());
		} else {
			Debug.Log(currentSpeed);
			arduino_port.Write (currentSpeed.ToString());
		}

	}

	public void OpenConnection() {

		if (arduino_port!= null) {
			if (arduino_port.IsOpen) {
				arduino_port.Close();
				Debug.Log("Closing port, because it was already open!");
			} else {
				arduino_port.Open();  // opens the connection
				arduino_port.ReadTimeout = 16;  // sets the timeout value before reporting error
				Debug.Log("Port Opened!");
			}
		} else {
			if (arduino_port.IsOpen) {
				Debug.Log("Port is already open");
			} else {
				Debug.Log("Port == null");
			}
		}
	}
		
	void OnApplicationQuit(){
		Debug.Log("000");
		arduino_port.Write("000");
		arduino_port.Close();
	}
}
