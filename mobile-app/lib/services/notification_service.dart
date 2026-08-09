import 'dart:developer' as developer;

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';

typedef NotificationTapHandler = void Function(Map<String, dynamic> data);
typedef ForegroundMessageHandler = void Function(RemoteMessage message);

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    await Firebase.initializeApp();
    developer.log(
      'Background FCM: ${message.messageId}',
      name: 'NotificationService',
    );
  } catch (e, stack) {
    developer.log(
      'Background handler error: $e',
      name: 'NotificationService',
      error: e,
      stackTrace: stack,
    );
  }
}

class NotificationService {
  NotificationService();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  NotificationTapHandler? _onNotificationTap;
  ForegroundMessageHandler? _onForegroundMessage;

  Future<void> initialize({
    required NotificationTapHandler onNotificationTap,
    ForegroundMessageHandler? onForegroundMessage,
  }) async {
    try {
      _onNotificationTap = onNotificationTap;
      _onForegroundMessage = onForegroundMessage;

      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      await _requestPermissions();
      await _configureFcmHandlers();
      await refreshAndPersistToken();
    } catch (e, stack) {
      developer.log(
        'Notification init failed: $e',
        name: 'NotificationService',
        error: e,
        stackTrace: stack,
      );
      rethrow;
    }
  }

  Future<void> _requestPermissions() async {
    try {
      await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      await _messaging.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );
    } catch (e, stack) {
      developer.log(
        'Notification permission error: $e',
        name: 'NotificationService',
        error: e,
        stackTrace: stack,
      );
    }
  }

  Future<void> _configureFcmHandlers() async {
    FirebaseMessaging.onMessage.listen((message) {
      try {
        _onForegroundMessage?.call(message);
      } catch (e, stack) {
        developer.log(
          'Foreground message error: $e',
          name: 'NotificationService',
          error: e,
          stackTrace: stack,
        );
      }
    });

    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      try {
        _handleRemoteMessageTap(message);
      } catch (e, stack) {
        developer.log(
          'Message opened error: $e',
          name: 'NotificationService',
          error: e,
          stackTrace: stack,
        );
      }
    });

    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleRemoteMessageTap(initialMessage);
    }

    _messaging.onTokenRefresh.listen((token) async {
      try {
        await _persistToken(token);
      } catch (e, stack) {
        developer.log(
          'Token refresh error: $e',
          name: 'NotificationService',
          error: e,
          stackTrace: stack,
        );
      }
    });
  }

  Future<String?> refreshAndPersistToken() async {
    try {
      final token = await _messaging.getToken();
      if (token != null) {
        await _persistToken(token);
      }
      return token;
    } catch (e, stack) {
      developer.log(
        'Get token error: $e',
        name: 'NotificationService',
        error: e,
        stackTrace: stack,
      );
      return null;
    }
  }

  Future<void> _persistToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConfig.prefsFcmToken, token);
  }

  void _handleRemoteMessageTap(RemoteMessage message) {
    if (message.data.isEmpty) {
      return;
    }
    _onNotificationTap?.call(Map<String, dynamic>.from(message.data));
  }
}
