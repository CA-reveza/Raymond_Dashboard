import 'dart:isolate';
import 'dart:ui';

import 'dart:developer' as developer;

/// Bridges FCM token requests between the geofence background isolate
/// and the main app isolate via [IsolateNameServer].
class IsolateTokenBridge {
  IsolateTokenBridge._();

  static const String portName = 'freesalewifi_fcm_token_port';

  static ReceivePort? _receivePort;

  /// Call from the main isolate after FCM token is available.
  static void register(Future<String?> Function() tokenProvider) {
    try {
      _receivePort?.close();
      IsolateNameServer.removePortNameMapping(portName);

      _receivePort = ReceivePort();
      IsolateNameServer.registerPortWithName(
        _receivePort!.sendPort,
        portName,
      );

      _receivePort!.listen((message) async {
        if (message is SendPort) {
          try {
            final token = await tokenProvider();
            message.send(token);
          } catch (e, stack) {
            developer.log(
              'Token bridge provider error: $e',
              name: 'IsolateTokenBridge',
              error: e,
              stackTrace: stack,
            );
            message.send(null);
          }
        }
      });

      developer.log('FCM token bridge registered', name: 'IsolateTokenBridge');
    } catch (e, stack) {
      developer.log(
        'Failed to register token bridge: $e',
        name: 'IsolateTokenBridge',
        error: e,
        stackTrace: stack,
      );
    }
  }

  static void unregister() {
    try {
      IsolateNameServer.removePortNameMapping(portName);
      _receivePort?.close();
      _receivePort = null;
    } catch (e) {
      developer.log('Token bridge unregister error: $e', name: 'IsolateTokenBridge');
    }
  }

  /// Request the FCM token from the main isolate (geofence callback isolate).
  static Future<String?> requestToken({
    Duration timeout = const Duration(seconds: 5),
  }) async {
    try {
      final mainSendPort = IsolateNameServer.lookupPortByName(portName);
      if (mainSendPort == null) {
        developer.log('Token bridge port not found', name: 'IsolateTokenBridge');
        return null;
      }

      final responsePort = ReceivePort();
      mainSendPort.send(responsePort.sendPort);

      final response = await responsePort.first.timeout(
        timeout,
        onTimeout: () => null,
      );
      responsePort.close();

      if (response is String && response.isNotEmpty) {
        return response;
      }
      return null;
    } catch (e, stack) {
      developer.log(
        'Token bridge request failed: $e',
        name: 'IsolateTokenBridge',
        error: e,
        stackTrace: stack,
      );
      return null;
    }
  }
}
