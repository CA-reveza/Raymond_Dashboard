import 'dart:async';
import 'dart:developer' as developer;
import 'dart:io';

import 'package:geofence_foreground_service/geofence_foreground_service.dart';
import 'package:geofence_foreground_service/models/zone.dart';
import 'package:layrz_wifi/layrz_wifi.dart';
import 'package:permission_handler/permission_handler.dart';

import '../config/app_config.dart';
import 'api_service.dart';

@pragma('vm:entry-point')
void geofenceCallbackDispatcher() {
  GeofenceForegroundService().handleTrigger(
    backgroundTriggerHandler: (zoneId, triggerType) async {
      developer.log(
        'Geofence trigger zone=$zoneId type=$triggerType',
        name: 'GeofenceCallback',
      );

      if (triggerType != GeofenceEventType.enter) {
        return true;
      }

      try {
        if (Platform.isAndroid) {
          final scanResult = await _androidWifiScanForSsid();
          if (scanResult == WifiScanOutcome.found) {
            await triggerWifiOfferFromIsolate();
          } else if (scanResult == WifiScanOutcome.scanFailed) {
            developer.log(
              'WiFi scan failed, falling back to geofence-only trigger',
              name: 'GeofenceCallback',
            );
            await triggerWifiOfferFromIsolate();
          } else {
            developer.log(
              'FreeSaleWiFi SSID not in range, skipping push',
              name: 'GeofenceCallback',
            );
          }
        } else {
          await triggerWifiOfferFromIsolate();
        }
      } catch (e, stack) {
        developer.log(
          'Geofence handler error: $e',
          name: 'GeofenceCallback',
          error: e,
          stackTrace: stack,
        );
      }

      return true;
    },
  );
}

enum WifiScanOutcome { found, notFound, scanFailed }

Future<WifiScanOutcome> _androidWifiScanForSsid() async {
  try {
    final wifi = LayrzWifi.instance;
    final canScan = await wifi.hasDiscovery();

    if (!canScan) {
      return WifiScanOutcome.scanFailed;
    }

    final granted = await wifi.requestPermissions();
    if (!granted) {
      return WifiScanOutcome.scanFailed;
    }

    final foundCompleter = Completer<bool>();
    final networks = <String>{};

    final resultsSub = wifi.scanResults.listen((network) {
      if (network.ssid.isNotEmpty) {
        networks.add(network.ssid);
      }
      if (network.ssid == AppConfig.wifiSsid) {
        if (!foundCompleter.isCompleted) {
          foundCompleter.complete(true);
        }
      }
    });

    await wifi.startScan();

    final found = await Future.any<bool>([
      foundCompleter.future,
      Future<bool>.delayed(
        Duration(seconds: AppConfig.wifiScanDurationSeconds),
        () => networks.contains(AppConfig.wifiSsid),
      ),
    ]);

    await resultsSub.cancel();
    await wifi.stopScan();

    return found ? WifiScanOutcome.found : WifiScanOutcome.notFound;
  } catch (e, stack) {
    developer.log(
      'WiFi scan failed, using geofence-only fallback: $e',
      name: 'GeofenceCallback',
      error: e,
      stackTrace: stack,
    );
    return WifiScanOutcome.scanFailed;
  }
}

class GeofenceService {
  GeofenceService();

  bool _isRunning = false;

  bool get isRunning => _isRunning;

  Future<bool> requestPermissions() async {
    try {
      final locationStatus = await Permission.location.request();
      if (!locationStatus.isGranted) {
        return false;
      }

      final alwaysStatus = await Permission.locationAlways.request();
      if (!alwaysStatus.isGranted) {
        developer.log(
          'Background location not granted; geofencing may be limited',
          name: 'GeofenceService',
        );
      }

      if (Platform.isAndroid) {
        await Permission.notification.request();

        if (Platform.isAndroid) {
          final wifi = LayrzWifi.instance;
          if (await wifi.hasDiscovery()) {
            await wifi.requestPermissions();
          }
        }
      }

      return locationStatus.isGranted;
    } catch (e, stack) {
      developer.log(
        'Permission request failed: $e',
        name: 'GeofenceService',
        error: e,
        stackTrace: stack,
      );
      return false;
    }
  }

  Future<void> startGeofencing() async {
    try {
      final hasPermission = await requestPermissions();
      if (!hasPermission) {
        throw GeofenceException(
          'Location services required. Please enable in settings',
        );
      }

      final service = GeofenceForegroundService();

      final started = await service.startGeofencingService(
        contentTitle: 'FreeSaleWiFi| Watching nearby stores',
        contentText: 'Watching for ${AppConfig.wifiSsid}...',
        notificationChannelId: AppConfig.notificationChannelId,
        serviceId: AppConfig.foregroundServiceId,
        callbackDispatcher: geofenceCallbackDispatcher,
      );

      if (!started) {
        throw GeofenceException(
          'Location services required. Please enable in settings',
        );
      }

      await service.removeGeofenceZone(zoneId: AppConfig.geofenceZoneId);

      await service.addGeofenceZone(
        zone: Zone(
          id: AppConfig.geofenceZoneId,
          radius: AppConfig.geofenceRadiusMeters.toDouble(),
          coordinates: [
            LatLng(AppConfig.storeLat, AppConfig.storeLng),
          ],
          triggers: [GeofenceEventType.enter],
          expirationDuration: const Duration(days: 365),
          initialTrigger: GeofenceEventType.enter,
          notificationResponsivenessMs: AppConfig.notificationResponsivenessMs,
        ),
      );

      _isRunning = true;
      developer.log('Geofencing started', name: 'GeofenceService');
    } catch (e, stack) {
      _isRunning = false;
      developer.log(
        'Failed to start geofencing: $e',
        name: 'GeofenceService',
        error: e,
        stackTrace: stack,
      );
      if (e is GeofenceException) {
        rethrow;
      }
      throw GeofenceException(
        'Location services required. Please enable in settings',
      );
    }
  }

  Future<void> stopGeofencing() async {
    try {
      final service = GeofenceForegroundService();
      await service.removeGeofenceZone(zoneId: AppConfig.geofenceZoneId);
      await service.stopGeofencingService();
      _isRunning = false;
      developer.log('Geofencing stopped', name: 'GeofenceService');
    } catch (e, stack) {
      developer.log(
        'Failed to stop geofencing: $e',
        name: 'GeofenceService',
        error: e,
        stackTrace: stack,
      );
      _isRunning = false;
    }
  }
}

class GeofenceException implements Exception {
  GeofenceException(this.message);

  final String message;

  @override
  String toString() => message;
}
