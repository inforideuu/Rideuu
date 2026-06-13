import urllib.request
import urllib.parse
import json

keys = {
    "places": "AIzaSyAdWfMNJNf8Wk45J5LitPnWcHVu4myywsg",
    "directions": "AIzaSyDEtk1OEt4N8SkS1C-Wkm0qfE80YA8dRtw",
    "geocoding": "AIzaSyBoeffVEp4QLVZvVv17RSJzQjj87i_qRgE"
}

# 1. Test Places Autocomplete API
places_url = f"https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Nungambakkam&key={keys['places']}"
try:
    with urllib.request.urlopen(places_url) as res:
        data = json.loads(res.read().decode())
        print("Places API Status:", data.get("status"))
        if data.get("status") != "OK":
            print("Places API Response:", data)
except Exception as e:
    print("Places API Exception:", e)

# 2. Test Directions API
directions_url = f"https://maps.googleapis.com/maps/api/directions/json?origin=13.0827,80.2707&destination=13.0382,80.2785&key={keys['directions']}"
try:
    with urllib.request.urlopen(directions_url) as res:
        data = json.loads(res.read().decode())
        print("Directions API Status:", data.get("status"))
        if data.get("status") != "OK":
            print("Directions API Response:", data)
except Exception as e:
    print("Directions API Exception:", e)

# 3. Test Geocoding API (using geocoding key)
geocoding_url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng=13.0827,80.2707&key={keys['geocoding']}"
try:
    with urllib.request.urlopen(geocoding_url) as res:
        data = json.loads(res.read().decode())
        print("Geocoding API Status:", data.get("status"))
        if data.get("status") != "OK":
            print("Geocoding API Response:", data)
except Exception as e:
    print("Geocoding API Exception:", e)
