import requests


def open_door():
    try:
        requests.get(f"http://10.208.52.32/open", timeout=2)
        print("Door opened")
    except:
        print("ESP32 not reachable")
    