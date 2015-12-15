#pragma strict

var centerOfMass : Vector3;
var wheelFL : WheelCollider;
var wheelFR : WheelCollider;
var wheelRL : WheelCollider;
var wheelRR : WheelCollider;
var wheelFLTrans : Transform;
var wheelFRTrans : Transform;
var wheelRLTrans : Transform;
var wheelRRTrans : Transform;
var lowestSteerAtSpeed : float = 50;
var lowSpeedSteerAngel : float = 10;
var highSpeedSteerAngel : float = 1;
var decellarationSpeed : float = 30;
var maxTorque : float  = 50;
var currentSpeed : float;
var topSpeed : float = 150;
var maxReverseSpeed : float = 50;
var maxBrakeTorque : float = 100;
private var braked : boolean = false;

private var mySidewayFriction : float;
private var myForwardFriction : float;
private var slipSidewayFriction : float;
private var slipForwardFriction : float;
 
var gearRatio : int[];

function Start () {
	GetComponent.<Rigidbody>().centerOfMass=centerOfMass;
	SetValues();
}

function SetValues () {
	myForwardFriction  = wheelRR.forwardFriction.stiffness;
	mySidewayFriction  = wheelRR.sidewaysFriction.stiffness;
	slipForwardFriction = 0.05;
	slipSidewayFriction = 0.085;
}
 
function FixedUpdate () {
	Controle ();
	HandBrake();
}

function Update(){
	wheelFLTrans.Rotate(wheelFL.rpm/60*360*Time.deltaTime,0,0);
	wheelFRTrans.Rotate(wheelFR.rpm/60*360*Time.deltaTime,0,0);
	wheelRLTrans.Rotate(wheelRL.rpm/60*360*Time.deltaTime,0,0);
	wheelRRTrans.Rotate(wheelRR.rpm/60*360*Time.deltaTime,0,0);
	wheelFLTrans.localEulerAngles.y = wheelFL.steerAngle - wheelFLTrans.localEulerAngles.z;
	wheelFRTrans.localEulerAngles.y = wheelFR.steerAngle - wheelFRTrans.localEulerAngles.z;
	
	print(Input.GetAxis("Vertical"));
	
	WheelPosition();
	ReverseSlip();
}

function Controle (){
	currentSpeed = 2*22/7*wheelRL.radius*wheelRL.rpm*60/1000;
	currentSpeed = Mathf.Round(currentSpeed);

	if (currentSpeed < topSpeed && currentSpeed > -maxReverseSpeed && !braked){
		wheelRR.motorTorque = maxTorque * Input.GetAxis("Vertical");
		wheelRL.motorTorque = maxTorque * Input.GetAxis("Vertical");
	} else {
		wheelRR.motorTorque = 0;
		wheelRL.motorTorque = 0;
	}

	if (Input.GetButton("Vertical")==false){
		wheelRR.brakeTorque = decellarationSpeed;
		wheelRL.brakeTorque = decellarationSpeed;
	} else{
		wheelRR.brakeTorque = 0;
		wheelRL.brakeTorque = 0;
	}

	var speedFactor = GetComponent.<Rigidbody>().velocity.magnitude/lowestSteerAtSpeed;
	var currentSteerAngel = Mathf.Lerp(lowSpeedSteerAngel,highSpeedSteerAngel,speedFactor);
	currentSteerAngel *= Input.GetAxis("Horizontal");
	wheelFL.steerAngle = currentSteerAngel;
	wheelFR.steerAngle = currentSteerAngel;
}

function WheelPosition(){
	
	var hit : RaycastHit;
	var wheelPos : Vector3;
 
	//FL
	if (Physics.Raycast(wheelFL.transform.position, -wheelFL.transform.up,hit,wheelFL.radius+wheelFL.suspensionDistance) ){
		wheelPos = hit.point+wheelFL.transform.up * wheelFL.radius;
	} else {
		wheelPos = wheelFL.transform.position -wheelFL.transform.up* wheelFL.suspensionDistance;
	}
	wheelFLTrans.position = wheelPos;
 
	//FR
	if (Physics.Raycast(wheelFR.transform.position, -wheelFR.transform.up,hit,wheelFR.radius+wheelFR.suspensionDistance) ){
		wheelPos = hit.point+wheelFR.transform.up * wheelFR.radius;
	} else {
		wheelPos = wheelFR.transform.position -wheelFR.transform.up* wheelFR.suspensionDistance;
	}
	wheelFRTrans.position = wheelPos;
	
	//RL
	if (Physics.Raycast(wheelRL.transform.position, -wheelRL.transform.up,hit,wheelRL.radius+wheelRL.suspensionDistance) ){
		wheelPos = hit.point+wheelRL.transform.up * wheelRL.radius;
	} else {
		wheelPos = wheelRL.transform.position -wheelRL.transform.up* wheelRL.suspensionDistance;
	}
	
	wheelRLTrans.position = wheelPos;
 
	//RR 
	if (Physics.Raycast(wheelRR.transform.position, -wheelRR.transform.up,hit,wheelRR.radius+wheelRR.suspensionDistance) ){
		wheelPos = hit.point+wheelRR.transform.up * wheelRR.radius;
	} else {
		wheelPos = wheelRR.transform.position -wheelRR.transform.up* wheelRR.suspensionDistance;
	}
	
	wheelRRTrans.position = wheelPos;
}

function HandBrake(){

	if (Input.GetButton("Jump")){
		braked = true;
	} else {
		braked = false;
	}

	if (braked){
		if (currentSpeed > 1){
			
			wheelFR.brakeTorque = maxBrakeTorque;
			wheelFL.brakeTorque = maxBrakeTorque;
			wheelRR.motorTorque =0;
			wheelRL.motorTorque =0;
			SetRearSlip(slipForwardFriction ,slipSidewayFriction);
		
		} else if (currentSpeed < 0){
		
			wheelRR.brakeTorque = maxBrakeTorque;
			wheelRL.brakeTorque = maxBrakeTorque;
			wheelRR.motorTorque =0;
			wheelRL.motorTorque =0;
			SetRearSlip(1 ,1);
		
		} else {
			SetRearSlip(1 ,1);
		}
	} else {
		wheelFR.brakeTorque = 0;
		wheelFL.brakeTorque = 0;
		SetRearSlip(myForwardFriction ,mySidewayFriction);
	}
}

function ReverseSlip(){
	if (currentSpeed < 0){
		SetFrontSlip(slipForwardFriction ,slipSidewayFriction);
	} else {
		SetFrontSlip(myForwardFriction ,mySidewayFriction);
	}
}
 
function SetRearSlip (currentForwardFriction : float,currentSidewayFriction : float){
	wheelRR.forwardFriction.stiffness = currentForwardFriction;
	wheelRL.forwardFriction.stiffness = currentForwardFriction;
	wheelRR.sidewaysFriction.stiffness = currentSidewayFriction;
	wheelRL.sidewaysFriction.stiffness = currentSidewayFriction;
}

function SetFrontSlip (currentForwardFriction : float,currentSidewayFriction : float){
	wheelFR.forwardFriction.stiffness = currentForwardFriction;
	wheelFL.forwardFriction.stiffness = currentForwardFriction;
	wheelFR.sidewaysFriction.stiffness = currentSidewayFriction;
	wheelFL.sidewaysFriction.stiffness = currentSidewayFriction;
}

/*TODO in wip!
function CarSound(){
	
	// calculate pitch (keep it within reasonable bounds)
	float pitch = Mathf.Clamp(1.0f + ((motorRPM - idleRPM) / (shiftUpRPM - idleRPM) * 2.5f), 1.0f, 10.0f);
	audioSource.pitch = pitch;
		
	if (motorRPM > 100) {
		
		// turn on sound if it's not playing yet and RPM is > 100.
		if (!audioSource.isPlaying) {
			audioSource.Play();
		}
		
		// how long we should wait with engine RPM <= 100 before killing engine sound
		killEngine = Time.time + killEngineSoundTimeout;
	
	} else if ((audioSource.isPlaying) && (Time.time > killEngine)) {
	
			// standing still, kill engine sound.
		audioSource.Stop();
	}
}
*/

