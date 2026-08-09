import 'dart:io';
import 'dart:math';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';
import '../services/api_service.dart';
import '../services/geofence_service.dart';
import '../services/isolate_token_bridge.dart';
import '../services/notification_service.dart';

final apiServiceProvider = Provider<ApiService>((ref) {
  final service = ApiService();
  ref.onDispose(service.dispose);
  return service;
});

final geofenceServiceProvider = Provider<GeofenceService>((ref) {
  return GeofenceService();
});

final notificationServiceProvider = Provider<NotificationService>((ref) {
  return NotificationService();
});

final appStateProvider =
    StateNotifierProvider<AppStateNotifier, AppState>((ref) {
  return AppStateNotifier(
    apiService: ref.watch(apiServiceProvider),
    geofenceService: ref.watch(geofenceServiceProvider),
    notificationService: ref.watch(notificationServiceProvider),
  );
});

class AppState {
  const AppState({
    this.isLoading = true,
    this.onboardingComplete = false,
    this.userName = '',
    this.userPhone = '',
    this.userId = '',
    this.fcmToken,
    this.geofencingActive = false,
    this.isWakingServer = false,
    this.geofenceError,
    this.platform = '',
    this.pendingConsentPayload,
  });

  final bool isLoading;
  final bool onboardingComplete;
  final String userName;
  final String userPhone;
  final String userId;
  final String? fcmToken;
  final bool geofencingActive;
  final bool isWakingServer;
  final String? geofenceError;
  final String platform;
  final Map<String, dynamic>? pendingConsentPayload;

  AppState copyWith({
    bool? isLoading,
    bool? onboardingComplete,
    String? userName,
    String? userPhone,
    String? userId,
    String? fcmToken,
    bool? geofencingActive,
    bool? isWakingServer,
    String? geofenceError,
    bool clearGeofenceError = false,
    String? platform,
    Map<String, dynamic>? pendingConsentPayload,
    bool clearPendingConsent = false,
  }) {
    return AppState(
      isLoading: isLoading ?? this.isLoading,
      onboardingComplete: onboardingComplete ?? this.onboardingComplete,
      userName: userName ?? this.userName,
      userPhone: userPhone ?? this.userPhone,
      userId: userId ?? this.userId,
      fcmToken: fcmToken ?? this.fcmToken,
      geofencingActive: geofencingActive ?? this.geofencingActive,
      isWakingServer: isWakingServer ?? this.isWakingServer,
      geofenceError: clearGeofenceError
          ? null
          : (geofenceError ?? this.geofenceError),
      platform: platform ?? this.platform,
      pendingConsentPayload: clearPendingConsent
          ? null
          : (pendingConsentPayload ?? this.pendingConsentPayload),
    );
  }
}

class AppStateNotifier extends StateNotifier<AppState> {
  AppStateNotifier({
    required ApiService apiService,
    required GeofenceService geofenceService,
    required NotificationService notificationService,
  })  : _apiService = apiService,
        _geofenceService = geofenceService,
        _notificationService = notificationService,
        super(const AppState());

  final ApiService _apiService;
  final GeofenceService _geofenceService;
  final NotificationService _notificationService;

  Future<void> initialize({
    required void Function(Map<String, dynamic> data) onNotificationTap,
    void Function(RemoteMessage message)? onForegroundMessage,
  }) async {
    try {
      state = state.copyWith(
        isLoading: true,
        platform: Platform.isIOS ? 'iOS' : 'Android',
      );

      await _loadUserPrefs();

      await _notificationService.initialize(
        onNotificationTap: onNotificationTap,
        onForegroundMessage: onForegroundMessage,
      );

      final token = await _notificationService.refreshAndPersistToken();
      state = state.copyWith(fcmToken: token);

      IsolateTokenBridge.register(
        () async => _notificationService.refreshAndPersistToken(),
      );

      if (state.onboardingComplete) {
        await startGeofencing();
      }
    } catch (e) {
      state = state.copyWith(isLoading: false);
      rethrow;
    } finally {
      state = state.copyWith(isLoading: false);
    }
  }

  @override
  void dispose() {
    IsolateTokenBridge.unregister();
    super.dispose();
  }

  Future<void> _loadUserPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      var userId = prefs.getString(AppConfig.prefsUserId);
      if (userId == null || userId.isEmpty) {
        userId =
            'user_${DateTime.now().millisecondsSinceEpoch}_${Random().nextInt(99999)}';
        await prefs.setString(AppConfig.prefsUserId, userId);
      }

      state = state.copyWith(
        onboardingComplete:
            prefs.getBool(AppConfig.prefsOnboardingComplete) ?? false,
        userName: prefs.getString(AppConfig.prefsUserName) ?? '',
        userPhone: prefs.getString(AppConfig.prefsUserPhone) ?? '',
        userId: userId,
        fcmToken: prefs.getString(AppConfig.prefsFcmToken),
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> completeOnboarding({
    required String name,
    required String phone,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConfig.prefsUserName, name);
      await prefs.setString(AppConfig.prefsUserPhone, phone);

      state = state.copyWith(
        userName: name,
        userPhone: phone,
        onboardingComplete: true,
      );
      await prefs.setBool(AppConfig.prefsOnboardingComplete, true);

      await startGeofencing();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> startGeofencing() async {
    try {
      state = state.copyWith(clearGeofenceError: true);
      await _geofenceService.startGeofencing();
      state = state.copyWith(geofencingActive: _geofenceService.isRunning);
    } on GeofenceException catch (e) {
      state = state.copyWith(
        geofencingActive: false,
        geofenceError: e.message,
      );
      rethrow;
    } catch (e) {
      state = state.copyWith(
        geofencingActive: false,
        geofenceError:
            'Location services required. Please enable in settings',
      );
      rethrow;
    }
  }

  void setPendingConsent(Map<String, dynamic> data) {
    state = state.copyWith(pendingConsentPayload: data);
  }

  void clearPendingConsent() {
    state = state.copyWith(clearPendingConsent: true);
  }

  void setWakingServer(bool value) {
    state = state.copyWith(isWakingServer: value);
  }

  Future<Map<String, dynamic>> triggerTestPush() async {
    final token = state.fcmToken;
    if (token == null || token.isEmpty) {
      throw ApiException('Notification permission required');
    }

    return _apiService.triggerWifiOffer(
      fcmToken: token,
      storeId: AppConfig.storeId,
      storeName: AppConfig.storeName,
      userId: state.userId,
      platform: Platform.isIOS ? 'ios' : 'android',
      onLoadingState: (waking) => setWakingServer(waking),
    );
  }
}
