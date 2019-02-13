import RPi.GPIO as GPIO
import time
import smbus
import math
import pigpio 

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

button_interrupt_enabled = {}
button_was_pressed = {}
servo_object = {}
servo_last_value = {}

pi = pigpio.pi()

def turnLedOn(pin=5):
  GPIO.setup(pin, GPIO.OUT)
  GPIO.output(pin, GPIO.HIGH)

def turnLedOff(pin=5):
  GPIO.setup(pin, GPIO.OUT)
  GPIO.output(pin, GPIO.LOW)

def setLedState(state, pin):
  GPIO.setup(pin, GPIO.OUT)
  if state:
    GPIO.output(pin, GPIO.HIGH)
  else:
    GPIO.output(pin, GPIO.LOW)

def buzzOn(pin):
  GPIO.setup(pin, GPIO.OUT)
  GPIO.output(pin, GPIO.HIGH)

def buzzOff(pin):
  GPIO.setup(pin, GPIO.OUT)
  GPIO.output(pin, GPIO.LOW)

def magnetOn(pin):
  GPIO.setup(pin, GPIO.OUT)
  GPIO.output(pin, GPIO.HIGH)

def magnetOff(pin):
  GPIO.setup(pin, GPIO.OUT)
  GPIO.output(pin, GPIO.LOW)

def getButtonState(button):
	GPIO.setup(button, GPIO.IN)
	return GPIO.input(button)

def waitForButton(button):
	GPIO.setup(button, GPIO.IN)
	while not GPIO.input(button):
		time.sleep(0.01)
	time.sleep(0.1) # debounce

def buttonWasPressedCallback(button):
    button_was_pressed[button] = 1

def buttonWasPressed(button):
    init = False
    try:
        init = button_interrupt_enabled[button];
    except:
        pass

    if not init:
        button_interrupt_enabled[button] = True
        GPIO.setup(button, GPIO.IN, pull_up_down=GPIO.PUD_UP)
        GPIO.add_event_detect(button, GPIO.FALLING, callback=buttonWasPressedCallback, bouncetime=300)

    wasPressed = 0

    try:
        wasPressed = button_was_pressed[button]
        button_was_pressed[button] = 0
    except:
            pass

    return wasPressed

usleep = lambda x: time.sleep(x / 1000000.0)

_TIMEOUT1 = 1000
_TIMEOUT2 = 10000

def getDistance(pin):
	GPIO.setup(pin, GPIO.OUT)
	GPIO.output(pin, GPIO.LOW)
	usleep(2)
	GPIO.output(pin, GPIO.HIGH)
	usleep(10)
	GPIO.output(pin, GPIO.LOW)

	GPIO.setup(pin, GPIO.IN)

	t0 = time.time()
	count = 0
	while count < _TIMEOUT1:
		if GPIO.input(pin):
			break
		count += 1
	if count >= _TIMEOUT1:
		return None

	t1 = time.time()
	count = 0
	while count < _TIMEOUT2:
		if not GPIO.input(pin):
			break
		count += 1
	if count >= _TIMEOUT2:
		return None

	t2 = time.time()

	dt = int((t1 - t0) * 1000000)
	if dt > 530:
		return None

	distance = ((t2 - t1) * 1000000 / 29 / 2)    # cm

	return distance

def displayText(line1, line2=""):
	address = 0x3e
	bus = smbus.SMBus(1)

	bus.write_byte_data(address, 0x80, 0x01) #clear
	time.sleep(0.05)
	bus.write_byte_data(address, 0x80, 0x08 | 0x04) # display on, no cursor
	bus.write_byte_data(address, 0x80, 0x28) # two lines
	time.sleep(0.05)

	# This will allow arguments to be numbers
	line1 = str(line1)
	line2 = str(line2)

	count = 0
	for c in line1:
		bus.write_byte_data(address, 0x40, ord(c))
		count += 1
		if count == 16:
			break

	bus.write_byte_data(address, 0x80, 0xc0) # Next line
	count = 0
	for c in line2:
		bus.write_byte_data(address, 0x40, ord(c))
		count += 1
		if count == 16:
			break
'''
def setServoAngle(pin, angle):
    servo = None
    try:
        servo = servo_object[pin]
        print ("found servo object " + str(servo));
    except:
        pass

    if servo is None:
        GPIO.setup(pin, GPIO.OUT)
        servo = GPIO.PWM(pin, 50)
        servo_object[pin] = servo
        servo.start(2.5)
        print("Creating servo object " + str(servo))


    angle = max(min(angle, 180), 0) # normalize the angle to 0-180
    duty = round((10 / 180 * angle) + 2.5, 1)

    print ("Normalized angle " + str(angle))

    last_value = -1
    try:
        last_value = servo_last_value[pin]
    except:
        pass

    if last_value != angle:
        print("Setting angle duty " + str(duty));
        servo.ChangeDutyCycle(duty)
#        servo.start(duty)
        #time.sleep(0.10)
        #servo.stop()
        servo_last_value[pin] = angle
'''

def setServoAngle(pin, angle):
	pulsewidth = (angle * 11.11) + 500
	pi.set_servo_pulsewidth(pin, pulsewidth)

def readADC(pin):
	reg = 0x30 + pin
	address = 0x04

	bus = smbus.SMBus(1)
	bus.write_byte(address, reg)
	return bus.read_word_data(address, reg)


def readTemperature(pin):
	B = 4275.
	R0 = 100000.

	val = readADC(pin)

	r = 1000. / val - 1.
	r = R0 * r

	return round(1. / (math.log10(r / R0) / B + 1 / 298.15) - 273.15, 1)

def readRotaryAngle(pin):
	return int(readADC(pin) / 10)

def readSoundSensor(pin):
	return int(readADC(pin) / 10)

def readlightSensor(pin):
	return int(readADC(pin) * 100 / 631)
