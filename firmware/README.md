# AXIONIK Firmware — ESP32 Captive Portal Sketches

> Arduino sketches for ESP32 boards serving branded captive portal experiences.

## Sketches

| Folder | Store | Description |
|--------|-------|-------------|
| `esp32_captive_portal/` | CRAV BISTRO | Food ordering portal with cart, menu, checkout |

## Shared Utilities

`shared/common_utils.h` provides:
- `AXIONIK_BACKEND_URL` — backend API URL constant
- `AXIONIK_STORE_ID` — store identifier
- `generateToken()` — AX-XXXXXX token generator
- `makeSuccessJson()` / `makeErrorJson()` — JSON response helpers
- Logging macros: `AXIONIK_LOG()`, `AXIONIK_LOGF()`

## How to Flash

1. Install [Arduino IDE](https://www.arduino.cc/en/software)
2. Add ESP32 board support:
   - File → Preferences → Additional Boards Manager URLs:
   - `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. Install board: Tools → Board → Boards Manager → search "esp32"
4. Open a sketch folder (e.g., `esp32_captive_portal/`)
5. Update `AXIONIK_BACKEND_URL` in `shared/common_utils.h`
6. Select your board: Tools → Board → ESP32 Dev Module
7. Flash: Sketch → Upload

## How it Works

1. ESP32 creates a WiFi hotspot (`AXIONIK` SSID)
2. DNS server redirects all domains to `192.168.4.1`
3. Any HTTP request serves the captive portal HTML
4. Customer fills sign-in form → data sent to `/register-customer`
5. WiFi access granted after registration
