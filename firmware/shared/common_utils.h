/**
 * FILE: firmware/shared/common_utils.h
 * DESCRIPTION: Shared constants and utilities for all AXIONIK ESP32 firmware sketches
 */

#pragma once

#include <Arduino.h>

// ====== AXIONIK NETWORK CONFIG ======
// Update BACKEND_URL to your deployed Render/cloud server before flashing
#ifndef AXIONIK_BACKEND_URL
  #define AXIONIK_BACKEND_URL "https://axionik-api.onrender.com"
#endif

#ifndef AXIONIK_STORE_ID
  #define AXIONIK_STORE_ID "store_001"
#endif

// ====== DNS & AP CONFIG ======
constexpr byte AXIONIK_DNS_PORT = 53;
const IPAddress AXIONIK_AP_IP(192, 168, 4, 1);
const IPAddress AXIONIK_SUBNET(255, 255, 255, 0);

// ====== SERIAL LOGGING ======
#define AXIONIK_LOG(msg)   Serial.println(F("[AXIONIK] " msg))
#define AXIONIK_LOGF(fmt, ...) { \
  char _buf[128]; \
  snprintf(_buf, sizeof(_buf), fmt, __VA_ARGS__); \
  Serial.println(_buf); \
}

// ====== TOKEN GENERATOR ======
inline String generateToken() {
  return "AX-" + String(random(100000, 999999));
}

// ====== JSON HELPERS ======
inline String makeErrorJson(const char* message) {
  return String("{\"status\":\"error\",\"message\":\"") + message + "\"}";
}

inline String makeSuccessJson(const String& token, const char* message, const char* table = "15") {
  return String("{\"status\":\"success\",\"token\":\"") + token +
         "\",\"message\":\"" + message +
         "\",\"table\":\"" + table + "\"}";
}
