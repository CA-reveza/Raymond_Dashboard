class AppConfig {
  AppConfig._();

  // CHANGE TO ACTUAL STORE COORDINATES BEFORE DEPLOYMENT
  static const double storeLat = 40.7128;
  static const double storeLng = -74.0060;

  static const String storeId = 'store_001';
  static const String storeName = 'Your Store Name';
  static const String wifiSsid = 'FreeSaleWiFi';

  // CHANGE AFTER RENDER DEPLOYMENT
  static const String apiBase = 'https://your-app.onrender.com';

  static const int geofenceRadiusMeters = 150;
  static const int notificationResponsivenessMs = 5000;
  static const int wifiScanDurationSeconds = 3;
  static const int apiTimeoutSeconds = 60;
  static const int apiRetryDelaySeconds = 3;
  static const int apiTriggerMaxRetries = 4;
  static const int apiTriggerBackoffBaseSeconds = 3;
  static const int geofenceCooldownMinutes = 10;

  static const String prefsUserName = 'user_name';
  static const String prefsUserPhone = 'user_phone';
  static const String prefsUserId = 'user_id';
  static const String prefsOnboardingComplete = 'onboarding_complete';
  static const String prefsFcmToken = 'fcm_token';
  static const String prefsLastTriggerTime = 'last_trigger_time';

  static const String geofenceZoneId = 'freesalewifi_store_zone';
  static const int foregroundServiceId = 525601;
  static const String notificationChannelId =
      'com.freesalewifi.geofencing_channel';

  static String get dashboardUrl => '$apiBase/dashboard';
}
