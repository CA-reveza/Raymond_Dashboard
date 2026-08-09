import 'dart:convert';
import 'dart:developer' as developer;
import 'dart:io';
import 'dart:math';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/widgets.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';
import 'isolate_token_bridge.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ApiService {
  ApiService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;
  bool _isFirstCall = true;

  Future<Map<String, dynamic>> triggerWifiOffer({
    required String fcmToken,
    required String storeId,
    required String storeName,
    required String platform,
    String? userId,
    void Function(bool isWakingUp)? onLoadingState,
  }) async {
    return _postTriggerWithExponentialBackoff(
      endpoint: '/trigger-wifi-offer',
      body: {
        'fcm_token': fcmToken,
        'store_id': storeId,
        'store_name': storeName,
        'user_id': userId,
        'platform': platform,
      },
      onLoadingState: onLoadingState,
    );
  }

  Future<Map<String, dynamic>> connectConsent({
    required String fcmToken,
    required String storeId,
    required String userId,
    required bool consent,
    required String wifiSsid,
    void Function(bool isWakingUp)? onLoadingState,
  }) async {
    return _postWithRetry(
      endpoint: '/connect-consent',
      body: {
        'fcm_token': fcmToken,
        'store_id': storeId,
        'user_id': userId,
        'consent': consent,
        'wifi_ssid': wifiSsid,
      },
      onLoadingState: onLoadingState,
    );
  }

  Future<Map<String, dynamic>> healthCheck({
    void Function(bool isWakingUp)? onLoadingState,
  }) async {
    return _getWithRetry(
      endpoint: '/health',
      onLoadingState: onLoadingState,
    );
  }

  Future<Map<String, dynamic>> _postTriggerWithExponentialBackoff({
    required String endpoint,
    required Map<String, dynamic> body,
    void Function(bool isWakingUp)? onLoadingState,
  }) async {
    onLoadingState?.call(true);

    try {
      Object? lastError;

      for (var attempt = 0; attempt < AppConfig.apiTriggerMaxRetries; attempt++) {
        try {
          return await _post(
            endpoint: endpoint,
            body: body,
            manageWakingOverlay: false,
          );
        } catch (e) {
          lastError = e;
          final isLastAttempt = attempt == AppConfig.apiTriggerMaxRetries - 1;
          if (isLastAttempt) {
            break;
          }

          final delaySeconds = AppConfig.apiTriggerBackoffBaseSeconds *
              pow(2, attempt).toInt();
          developer.log(
            'trigger-wifi-offer attempt ${attempt + 1} failed, '
            'retrying in ${delaySeconds}s: $e',
            name: 'ApiService',
          );
          await Future<void>.delayed(Duration(seconds: delaySeconds));
        }
      }

      developer.log(
        'trigger-wifi-offer exhausted retries: $lastError',
        name: 'ApiService',
      );
      throw ApiException('Service temporarily unavailable');
    } finally {
      onLoadingState?.call(false);
    }
  }

  Future<Map<String, dynamic>> _postWithRetry({
    required String endpoint,
    required Map<String, dynamic> body,
    void Function(bool isWakingUp)? onLoadingState,
  }) async {
    try {
      return await _post(
        endpoint: endpoint,
        body: body,
        onLoadingState: onLoadingState,
      );
    } catch (firstError) {
      developer.log(
        'API call failed, retrying in ${AppConfig.apiRetryDelaySeconds}s: $firstError',
        name: 'ApiService',
      );
      await Future<void>.delayed(
        Duration(seconds: AppConfig.apiRetryDelaySeconds),
      );
      try {
        return await _post(
          endpoint: endpoint,
          body: body,
          onLoadingState: onLoadingState,
          isRetry: true,
        );
      } catch (retryError) {
        developer.log('API retry failed: $retryError', name: 'ApiService');
        throw ApiException('Service temporarily unavailable');
      }
    }
  }

  Future<Map<String, dynamic>> _getWithRetry({
    required String endpoint,
    void Function(bool isWakingUp)? onLoadingState,
  }) async {
    try {
      return await _get(endpoint: endpoint, onLoadingState: onLoadingState);
    } catch (firstError) {
      developer.log(
        'API GET failed, retrying: $firstError',
        name: 'ApiService',
      );
      await Future<void>.delayed(
        Duration(seconds: AppConfig.apiRetryDelaySeconds),
      );
      try {
        return await _get(
          endpoint: endpoint,
          onLoadingState: onLoadingState,
          isRetry: true,
        );
      } catch (retryError) {
        throw ApiException('Service temporarily unavailable');
      }
    }
  }

  Future<Map<String, dynamic>> _post({
    required String endpoint,
    required Map<String, dynamic> body,
    void Function(bool isWakingUp)? onLoadingState,
    bool isRetry = false,
    bool manageWakingOverlay = true,
  }) async {
    final showWakingUp = manageWakingOverlay && _isFirstCall && !isRetry;
    if (showWakingUp) {
      onLoadingState?.call(true);
    }

    try {
      final uri = Uri.parse('${AppConfig.apiBase}$endpoint');
      final response = await _client
          .post(
            uri,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(body),
          )
          .timeout(Duration(seconds: AppConfig.apiTimeoutSeconds));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      }

      throw ApiException(
        'Request failed (${response.statusCode})',
        statusCode: response.statusCode,
      );
    } finally {
      if (showWakingUp) {
        _isFirstCall = false;
        onLoadingState?.call(false);
      }
    }
  }

  Future<Map<String, dynamic>> _get({
    required String endpoint,
    void Function(bool isWakingUp)? onLoadingState,
    bool isRetry = false,
  }) async {
    final showWakingUp = _isFirstCall && !isRetry;
    if (showWakingUp) {
      onLoadingState?.call(true);
    }

    try {
      final uri = Uri.parse('${AppConfig.apiBase}$endpoint');
      final response = await _client
          .get(uri)
          .timeout(Duration(seconds: AppConfig.apiTimeoutSeconds));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      }

      throw ApiException(
        'Request failed (${response.statusCode})',
        statusCode: response.statusCode,
      );
    } finally {
      if (showWakingUp) {
        _isFirstCall = false;
        onLoadingState?.call(false);
      }
    }
  }

  void dispose() {
    _client.close();
  }
}

/// Resolve FCM token inside the geofence background isolate.
Future<String?> resolveFcmTokenInIsolate() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    var token = prefs.getString(AppConfig.prefsFcmToken);
    if (token != null && token.isNotEmpty) {
      return token;
    }

    token = await IsolateTokenBridge.requestToken();
    if (token != null && token.isNotEmpty) {
      await prefs.setString(AppConfig.prefsFcmToken, token);
      developer.log('FCM token from main isolate bridge', name: 'GeofenceIsolate');
      return token;
    }

    try {
      WidgetsFlutterBinding.ensureInitialized();
      await Firebase.initializeApp();
      token = await FirebaseMessaging.instance.getToken();
      if (token != null && token.isNotEmpty) {
        await prefs.setString(AppConfig.prefsFcmToken, token);
        developer.log('FCM token from Firebase re-init', name: 'GeofenceIsolate');
      }
      return token;
    } catch (e, stack) {
      developer.log(
        'Firebase re-init in isolate failed: $e',
        name: 'GeofenceIsolate',
        error: e,
        stackTrace: stack,
      );
      return null;
    }
  } catch (e, stack) {
    developer.log(
      'resolveFcmTokenInIsolate error: $e',
      name: 'GeofenceIsolate',
      error: e,
      stackTrace: stack,
    );
    return null;
  }
}

Future<bool> _postTriggerWifiOfferWithBackoff({
  required String fcmToken,
  required String? userId,
  required String platform,
}) async {
  final body = jsonEncode({
    'fcm_token': fcmToken,
    'store_id': AppConfig.storeId,
    'store_name': AppConfig.storeName,
    'user_id': userId,
    'platform': platform,
  });

  final uri = Uri.parse('${AppConfig.apiBase}/trigger-wifi-offer');
  Object? lastError;

  for (var attempt = 0; attempt < AppConfig.apiTriggerMaxRetries; attempt++) {
    final client = http.Client();
    try {
      final response = await client
          .post(
            uri,
            headers: {'Content-Type': 'application/json'},
            body: body,
          )
          .timeout(Duration(seconds: AppConfig.apiTimeoutSeconds));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return true;
      }

      lastError = 'HTTP ${response.statusCode}';
    } catch (e) {
      lastError = e;
    } finally {
      client.close();
    }

    final isLastAttempt = attempt == AppConfig.apiTriggerMaxRetries - 1;
    if (isLastAttempt) {
      break;
    }

    final delaySeconds =
        AppConfig.apiTriggerBackoffBaseSeconds * pow(2, attempt).toInt();
    developer.log(
      'Isolate trigger attempt ${attempt + 1} failed, retry in ${delaySeconds}s',
      name: 'GeofenceIsolate',
    );
    await Future<void>.delayed(Duration(seconds: delaySeconds));
  }

  developer.log(
    'Isolate trigger exhausted retries: $lastError',
    name: 'GeofenceIsolate',
  );
  return false;
}

/// Isolate-safe API trigger used from geofence background handler.
Future<void> triggerWifiOfferFromIsolate() async {
  try {
    final fcmToken = await resolveFcmTokenInIsolate();
    if (fcmToken == null || fcmToken.isEmpty) {
      developer.log('No FCM token available in isolate', name: 'GeofenceIsolate');
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getString(AppConfig.prefsUserId);

    final lastTrigger = prefs.getInt(AppConfig.prefsLastTriggerTime) ?? 0;
    final now = DateTime.now().millisecondsSinceEpoch;
    final cooldownMs = AppConfig.geofenceCooldownMinutes * 60 * 1000;
    if (now - lastTrigger < cooldownMs) {
      developer.log('Geofence trigger in cooldown', name: 'GeofenceIsolate');
      return;
    }

    final platform = Platform.isIOS ? 'ios' : 'android';
    final success = await _postTriggerWifiOfferWithBackoff(
      fcmToken: fcmToken,
      userId: userId,
      platform: platform,
    );

    if (success) {
      await prefs.setInt(AppConfig.prefsLastTriggerTime, now);
      developer.log('Isolate trigger success', name: 'GeofenceIsolate');
    }
  } catch (e, stack) {
    developer.log(
      'Isolate trigger error: $e',
      name: 'GeofenceIsolate',
      error: e,
      stackTrace: stack,
    );
  }
}
