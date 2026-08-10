#if defined(ESP32)
  #include <WiFi.h>
  #include <WebServer.h>
  #include <DNSServer.h>
  #include <HTTPClient.h>
  #include <ESPmDNS.h>
  WebServer server(80);
#elif defined(ESP8266)
  #include <ESP8266WiFi.h>
  #include <ESP8266WebServer.h>
  #include <DNSServer.h>
  #include <ESP8266HTTPClient.h>
  #include <ESP8266mDNS.h>
  ESP8266WebServer server(80);
#else
  #include <WiFi.h>
  #include <WebServer.h>
  #include <DNSServer.h>
  WebServer server(80);
#endif

#include "image.h"
#include "portal_html.h"

#ifndef LED_BUILTIN
  #define LED_BUILTIN 2
#endif

DNSServer dnsServer;

void logPrint(String msg) {
  Serial.print(msg);
}

void logPrintln(String msg) {
  Serial.println(msg);
}

struct Customer {
  String name;
  String phone;
  String email;
  String vipTier;
  long totalSpend;
  String lastVisit;
};

#define MAX_CUSTOMERS 30
Customer customerList[MAX_CUSTOMERS];
int customerCount = 0;
unsigned long lastHeartbeat = 0;

const char* STORE_WIFI_SSID     = "";                   // Main Wi-Fi SSID (Leave blank for Standalone AP)
const char* STORE_WIFI_PASSWORD = "";                   // Main Wi-Fi Password
const char* BACKEND_HOST        = "10.20.71.13";        // Verified active PC IP
const int   BACKEND_PORT        = 63265;                 // FastAPI main port

// Chunked Response Streaming via sendContent()
void handleRoot() {
  server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  server.sendHeader("Pragma", "no-cache");
  server.sendHeader("Expires", "-1");

  server.setContentLength(CONTENT_LENGTH_UNKNOWN);
  server.send(200, "text/html", "");

  const char* ptr = portal_html;
  size_t len = strlen_P(portal_html);
  size_t chunkSize = 1024;

  for (size_t i = 0; i < len; i += chunkSize) {
    size_t currentChunk = (i + chunkSize <= len) ? chunkSize : (len - i);
    char buf[1025];
    memcpy_P(buf, ptr + i, currentChunk);
    buf[currentChunk] = '\0';
    server.sendContent(buf);
  }
  server.sendContent("");
}

void forwardCheckinToBackend(String jsonBody) {
#if defined(ESP32)
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;

  // Try /api/signin first (handles login + feedback)
  String url1 = "http://" + String(BACKEND_HOST) + ":" + String(BACKEND_PORT) + "/api/signin";
  http.begin(url1);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(2000);
  int code = http.POST(jsonBody);
  http.end();
  if (code > 0) {
    logPrintln("  [BACKEND SYNC] HTTP " + String(code) + " -> " + url1);
  }

  // Also try /api/feedback (dedicated feedback handler -> saves to Supabase feedbacks table)
  String url2 = "http://" + String(BACKEND_HOST) + ":" + String(BACKEND_PORT) + "/api/feedback";
  http.begin(url2);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(2000);
  int code2 = http.POST(jsonBody);
  http.end();
  if (code2 > 0) {
    logPrintln("  [FEEDBACK SYNC] HTTP " + String(code2) + " -> " + url2);
  }
#endif
}


void handleApiSignin() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  
  String name = "";
  String phone = "";
  String email = "";
  String coupon = "";
  String feedback = "";
  String sentiment = "";
  String rating = "";

  if (server.hasArg("plain") && server.arg("plain").length() > 0) {
    String body = server.arg("plain");
    int nameIdx = body.indexOf("\"name\":\"");
    if (nameIdx != -1) {
      int endIdx = body.indexOf("\"", nameIdx + 8);
      if (endIdx != -1) name = body.substring(nameIdx + 8, endIdx);
    }
    int phoneIdx = body.indexOf("\"phone\":\"");
    if (phoneIdx != -1) {
      int endIdx = body.indexOf("\"", phoneIdx + 9);
      if (endIdx != -1) phone = body.substring(phoneIdx + 9, endIdx);
    }
    int emailIdx = body.indexOf("\"email\":\"");
    if (emailIdx != -1) {
      int endIdx = body.indexOf("\"", emailIdx + 9);
      if (endIdx != -1) email = body.substring(emailIdx + 9, endIdx);
    }
    int cpnIdx = body.indexOf("\"coupon\":\"");
    if (cpnIdx != -1) {
      int endIdx = body.indexOf("\"", cpnIdx + 10);
      if (endIdx != -1) coupon = body.substring(cpnIdx + 10, endIdx);
    }
    if (coupon.length() == 0) {
      int cpnCodeIdx = body.indexOf("\"couponCode\":\"");
      if (cpnCodeIdx != -1) {
        int endIdx = body.indexOf("\"", cpnCodeIdx + 14);
        if (endIdx != -1) coupon = body.substring(cpnCodeIdx + 14, endIdx);
      }
    }
    int sentIdx = body.indexOf("\"sentiment\":\"");
    if (sentIdx != -1) {
      int endIdx = body.indexOf("\"", sentIdx + 13);
      if (endIdx != -1) sentiment = body.substring(sentIdx + 13, endIdx);
    }
    int ratIdx = body.indexOf("\"rating\":");
    if (ratIdx != -1) {
      rating = body.substring(ratIdx + 9, ratIdx + 10);
    }
    int fbIdx = body.indexOf("\"feedback\":\"");
    if (fbIdx != -1) {
      int endIdx = body.indexOf("\"", fbIdx + 12);
      if (endIdx != -1) feedback = body.substring(fbIdx + 12, endIdx);
    }
    if (feedback.length() == 0) {
      int commentIdx = body.indexOf("\"comment\":\"");
      if (commentIdx != -1) {
        int endIdx = body.indexOf("\"", commentIdx + 11);
        if (endIdx != -1) feedback = body.substring(commentIdx + 11, endIdx);
      }
    }
  }

  if (server.hasArg("name")) name = server.arg("name");
  if (server.hasArg("username")) name = server.arg("username");
  if (server.hasArg("phone")) phone = server.arg("phone");
  if (server.hasArg("email")) email = server.arg("email");
  if (server.hasArg("coupon")) coupon = server.arg("coupon");
  if (server.hasArg("sentiment")) sentiment = server.arg("sentiment");
  if (server.hasArg("feedback")) feedback = server.arg("feedback");

  if (name.length() > 0 || phone.length() > 0 || email.length() > 0 || feedback.length() > 0 || sentiment.length() > 0) {
    String jsonOutput = "{\"name\":\"" + name + "\",\"phone\":\"" + phone + "\",\"email\":\"" + email + "\",\"coupon\":\"" + coupon + "\",\"sentiment\":\"" + sentiment + "\",\"rating\":\"" + rating + "\",\"feedback\":\"" + feedback + "\"}";
    
    Serial.println("\n==================================================");
    if (feedback.length() > 0 || sentiment.length() > 0) {
      Serial.println("  ★ REAL-TIME ESP32 PORTAL FEEDBACK CAPTURED ★");
    } else {
      Serial.println("  [LOGIN LOG] NEW USER SIGNED IN TO PORTAL!");
    }
    Serial.println("==================================================");
    Serial.println("Customer: " + name + " | Phone: " + phone + " | Email: " + email);
    if (sentiment.length() > 0) {
      Serial.println("Sentiment: " + sentiment + " | Rating: " + (rating.length() > 0 ? rating : "5") + "/5");
    }
    if (feedback.length() > 0) {
      Serial.println("Feedback Comment: \"" + feedback + "\"");
    }
    Serial.print("User Data: ");
    Serial.println(jsonOutput);
    Serial.flush();
    Serial.println("==================================================\n");

    forwardCheckinToBackend(jsonOutput);
  }

  server.send(200, "application/json", "{\"status\":\"ok\"}");
}

void handleGetCustomers() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  String json = "[";
  for (int i = 0; i < customerCount; i++) {
    json += "{\"name\":\"" + customerList[i].name + "\",\"phone\":\"" + customerList[i].phone + "\",\"email\":\"" + customerList[i].email + "\",\"vip_tier\":\"" + customerList[i].vipTier + "\",\"total_spend\":" + String(customerList[i].totalSpend) + ",\"last_visit\":\"" + customerList[i].lastVisit + "\"}";
    if (i < customerCount - 1) json += ",";
  }
  json += "]";
  server.send(200, "application/json", json);
}

void handleApiOrder() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    logPrintln("\n==========================================");
    logPrintln("  [ORDER LOG] NEW IN-STORE ORDER PLACED!");
    logPrintln("==========================================");
    logPrint("Order Data: ");
    logPrintln(body);
    logPrintln("==========================================\n");
  }
  server.send(200, "application/json", "{\"status\":\"ok\"}");
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);

  Serial.println("\n\n=============================================");
  Serial.println("  SHOPPERS STOP Captive Portal — AXIONIK");
  Serial.println("=============================================");

  WiFi.persistent(false);
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  delay(150);

  WiFi.mode(WIFI_AP_STA);
  delay(150);

  IPAddress apIP(192, 168, 4, 1);
  IPAddress gateway(192, 168, 4, 1);
  IPAddress subnet(255, 255, 255, 0);

  WiFi.softAPConfig(apIP, gateway, subnet);
  bool apOk = WiFi.softAP("SHOPPERS_STOP_WiFi", NULL, 1, 0, 4);
  
  if (apOk) {
    Serial.println(">>> SUCCESS: SHOPPERS_STOP_WiFi IS BROADCASTING! <<<");
    Serial.print("Access Point IP: ");
    Serial.println(WiFi.softAPIP().toString());
  } else {
    Serial.println(">>> ERROR: SoftAP failed to start! <<<");
  }

#if defined(ESP32) || defined(ESP8266)
  if (MDNS.begin("shoppersstop")) {
    Serial.println("mDNS Service: Started (http://shoppersstop.local)");
    MDNS.addService("http", "tcp", 80);
  }
#endif

  dnsServer.setErrorReplyCode(DNSReplyCode::NoError);
  dnsServer.start(53, "*", apIP);
  Serial.println("DNS Server: Started on Port 53");

  server.on("/", HTTP_GET, handleRoot);
  server.on("/generate_204", HTTP_GET, handleRoot);
  server.on("/gen_204", HTTP_GET, handleRoot);
  server.on("/hotspot-detect.html", HTTP_GET, handleRoot);
  server.on("/canonical.html", HTTP_GET, handleRoot);
  server.on("/connecttest.txt", HTTP_GET, handleRoot);
  server.on("/redirect", HTTP_GET, handleRoot);
  server.on("/mobile/status.php", HTTP_GET, handleRoot);
  server.on("/success.txt", HTTP_GET, [](){ server.send(200, "text/plain", "success"); });
  server.on("/ncsi.txt", HTTP_GET, [](){ server.send(200, "text/plain", "Microsoft NCSI"); });

  server.on("/", HTTP_POST, handleApiSignin);
    server.on("/", HTTP_POST, handleApiSignin);
  server.on("/api/signin", HTTP_POST, handleApiSignin);
  server.on("/api/customers", HTTP_POST, handleApiSignin);
  server.on("/api/redemptions", HTTP_POST, handleApiSignin);
  server.on("/api/feedback", HTTP_POST, handleApiSignin);
  server.on("/login", HTTP_POST, handleApiSignin);
  server.on("/connect", HTTP_POST, handleApiSignin);
  server.on("/submit", HTTP_POST, handleApiSignin);
  server.on("/login", HTTP_POST, handleApiSignin);
  server.on("/connect", HTTP_POST, handleApiSignin);
  server.on("/submit", HTTP_POST, handleApiSignin);
  server.on("/api/customers", HTTP_GET, handleGetCustomers);
  server.on("/api/order", HTTP_POST, handleApiOrder);

  server.onNotFound(handleRoot);

  server.begin();
  Serial.println("HTTP Web Server: Online (Listening on Port 80)");
  Serial.println("=============================================\n");
}

void loop() {
  dnsServer.processNextRequest();
  server.handleClient();

#if defined(ESP8266)
  MDNS.update();
#endif

  delay(5);

  if (millis() - lastHeartbeat > 2000) {
    lastHeartbeat = millis();
    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
    Serial.println("[ESP32 HEARTBEAT] SHOPPERS_STOP_WiFi is broadcasting...");
  }
}
