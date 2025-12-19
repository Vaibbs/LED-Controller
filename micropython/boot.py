from machine import Pin, PWM
import time
import _thread
import network
from microdot import Microdot, send_file, Response
import math

# Connecting to network
ssid = "Vidyalankar Campus"
wlan = network.WLAN(network.STA_IF)
wlan.active(True)

time.sleep(2.5)

wlan.connect(ssid)
#wlan.connect("hotspot", "pass")

t = 0
while not wlan.isconnected() and t < 120:
    time.sleep(1)
    t += 1
    print(t)
    
if not wlan.isconnected():
    print("Failed to connect to Wi-Fi. Restart to retry.")
    exit()
    
ap_if = network.WLAN(network.AP_IF)
ap_if.active(True)
ap_if.config(essid="IP:" + wlan.ifconfig()[0], password="direct2025", authmode=network.AUTH_WPA_WPA2_PSK)

print("AP started:", ap_if.ifconfig())

# host webpage when connected to network
Sync = {
    "Color": [139, 100, 0],
    "FadeIn": 2500,
    "FadeOut": 2500,
    "MaxBrightness": 95,
    "BypassSensor": [False, False],
    "SwitchDelay": [0, 5000],
    "Strobe": False,
    "StrobeSpeed": 1
}

max_duty = 750
control_loop_status = True
control_loop_speed_ms = 200
control_loop_speed_s = control_loop_speed_ms / 1000
current_brightness = 1.0

lock = _thread.allocate_lock()

def dict_to_json(d):
    def to_json_value(v):
        if isinstance(v, str):
            return '"' + v.replace('"', '\\"') + '"'
        elif isinstance(v, bool):
            return "true" if v else "false"
        elif isinstance(v, (int, float)):
            return str(v)
        elif isinstance(v, list):
            return "[" + ",".join(to_json_value(i) for i in v) + "]"
        elif isinstance(v, dict):
            return dict_to_json(v)
        else:
            return "null"
    items = []
    for k, v in d.items():
        items.append('"%s":%s' % (k, to_json_value(v)))
    return "{" + ",".join(items) + "}"

def strobe_color_generator(speed=1.0, delay=0.2):
    """
    Generates smoothly changing RGB colors based on speed.
    
    Args:
        speed (float): 0 = frozen, 1 = normal speed, >1 = faster
        delay (float): sleep time between each color step (seconds)
    """
    t = 0.0
    base_freq = 2 * math.pi / 5  # full color cycle every 5 seconds at speed=1
    
    while True:
        # If speed is zero, don't advance time
        if speed > 0:
            t += speed * delay
        
        # Smooth RGB cycling using phase-shifted sine waves
        r = int((math.sin(base_freq * t) * 0.5 + 0.5) * 255)
        g = int((math.sin(base_freq * t + 2 * math.pi / 3) * 0.5 + 0.5) * 255)
        b = int((math.sin(base_freq * t + 4 * math.pi / 3) * 0.5 + 0.5) * 255)
        
        yield [r, g, b]
        time.sleep(delay)

app = Microdot()

@app.route('/')
async def index(request):
  return send_file('web/index.html')

@app.route('/style.css')
async def style(request):
  return send_file('web/style.css')

@app.route('/script.js')
async def script(request):
  return send_file('web/script.js')

@app.route('/sync', methods=['POST', 'GET'])
async def sync(request):
    global Sync
    if request.method == 'POST':
        with lock:
            Sync = request.json
            Sync["MaxBrightness"] = max(0, min(Sync["MaxBrightness"], 100))
            Sync["FadeIn"] = max(1, Sync["FadeIn"])
            Sync["FadeOut"] = max(1, Sync["FadeOut"])
    else:
        with lock:
            body = dict_to_json(Sync)
        # Build response manually and set headers here
        return Response(
            body,
            headers={'Content-Type': 'application/json'},
            status_code=200
        )

relay = Pin(15, Pin.OUT, value=1)
proxy = Pin(34, Pin.IN)

# configure rgb controls
pin_r = Pin(13, Pin.OUT)
pin_g = Pin(12, Pin.OUT)
pin_b = Pin(14, Pin.OUT)

r = PWM(pin_r, freq=1000)
g = PWM(pin_g, freq=1000)
b = PWM(pin_b, freq=1000)

def set_rgb(r_duty, g_duty, b_duty, br = 100):
    br = max(0, min(br, 100))
    brightness = max_duty * (br / 100)
    r.duty(int((r_duty / 255) * brightness))
    g.duty(int((g_duty / 255) * brightness))
    b.duty(int((b_duty / 255) * brightness))

with lock:
    set_rgb(
        Sync["Color"][0],
        Sync["Color"][1],
        Sync["Color"][2],
        Sync["MaxBrightness"]
    )

def controlLoop():
    global current_brightness
    current_fade_time = 0
    direction = 1
    target = 1
    delay_ms = 0
    strobe_speed = 0
    with lock:
        strobe_speed = Sync["StrobeSpeed"]
    gen = strobe_color_generator(speed=strobe_speed, delay=control_loop_speed_s)
    while control_loop_status:
        with lock:
            # target value 0 means light on, 1 means light off
            new_target = proxy.value() if not Sync["BypassSensor"][0] else (0 if Sync["BypassSensor"][1] else 1)
            if target != new_target:
                target = new_target
                delay_ms = 0
            elif delay_ms < Sync["SwitchDelay"][target]:
                delay_ms += control_loop_speed_ms
            elif int(not target) != current_brightness:
                new_direction = -1 if target else 1
                
                if new_direction != direction:
                    direction = new_direction
                    current_fade_time = current_brightness * Sync["FadeOut" if target else "FadeIn"]
                
                current_fade_time = max(0, min(current_fade_time + direction * control_loop_speed_ms, Sync["FadeIn"])) # loop delay in s * 1000
                current_brightness = max(0, min(current_fade_time / Sync["FadeOut" if target else "FadeIn"], 1))
            
                relay.value(current_brightness == 0.0)

            if Sync["Strobe"]:
                # strobe the colors
                Sync["Color"] = next(gen)
        time.sleep(control_loop_speed_s)

def updateLoop():
    global current_brightness
    while control_loop_status:
        with lock:
            set_rgb(
                Sync["Color"][0],
                Sync["Color"][1],
                Sync["Color"][2],
                Sync["MaxBrightness"] * current_brightness
            )
        time.sleep(control_loop_speed_s) # average reaction time of person lol

try:
    print(wlan.ifconfig())
    _thread.start_new_thread(controlLoop, ())
    _thread.start_new_thread(updateLoop, ())
    app.run(port = 80)
except KeyboardInterrupt:
    print("Stopping Server")
    app.shutdown()
    print("Stopping Control & Update Loop")
    control_loop_status = False
    wlan.disconnect()