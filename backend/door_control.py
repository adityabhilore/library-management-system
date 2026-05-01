import requests
import time

ESP32_IP = "10.235.95.250"

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
        response = requests.get(f"http://{ESP32_IP}/open", timeout=2)

        if response.status_code == 200:
            print("Door opened successfully")
            last_open_time = now
        else:
            print("Door request failed")

    except Exception as e:
        print("ESP32 connection error:", e)
