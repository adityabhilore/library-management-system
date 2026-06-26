import requests
import time

# ✅ Only this line changed — everything else is exactly same
ESP32_HOST = "esp32-door.local"   # mDNS hostname — never changes

# cooldown timer
last_open_time = 0
COOLDOWN = 3   # seconds


def open_door():
    global last_open_time

    now = time.time()

    # prevent repeated requests
    if now - last_open_time < COOLDOWN:
        print("Door request ignored (cooldown active)")
        return

    try:
        response = requests.get(f"http://{ESP32_HOST}/open", timeout=2)  # ✅ hostname used here

        if response.status_code == 200:
            print("Door opened successfully")
            last_open_time = now
        else:
            print("Door request failed")

    except Exception as e:
        print("ESP32 connection error:", e)