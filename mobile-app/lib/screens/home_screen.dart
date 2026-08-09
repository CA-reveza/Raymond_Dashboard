import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';

import '../config/app_config.dart';
import '../providers/app_provider.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'consent_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  bool _isTriggering = false;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final active = ref.read(appStateProvider).geofencingActive;
    if (active) {
      _pulseController.repeat(reverse: true);
    } else {
      _pulseController.stop();
      _pulseController.reset();
    }
  }

  String _truncateToken(String? token) {
    if (token == null || token.isEmpty) {
      return 'Not available';
    }
    if (token.length <= 20) {
      return token;
    }
    return '${token.substring(0, 10)}...${token.substring(token.length - 8)}';
  }

  Future<void> _openDashboard() async {
    try {
      final uri = Uri.parse(AppConfig.dashboardUrl);
      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (!launched && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open dashboard')),
        );
      }
    } catch (e) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to open dashboard: $e')),
      );
    }
  }

  Future<void> _triggerTestPush() async {
    final token = ref.read(appStateProvider).fcmToken;
    if (token == null || token.isEmpty) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Notification permission required'),
          backgroundColor: AppTheme.error,
        ),
      );
      return;
    }

    setState(() => _isTriggering = true);

    try {
      final result = await ref.read(appStateProvider.notifier).triggerTestPush();
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Push sent! Visit ID: ${result['visit_id']}'),
          backgroundColor: AppTheme.success,
        ),
      );
    } on ApiException catch (e) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.message),
          backgroundColor: AppTheme.error,
        ),
      );
    } catch (e) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Service temporarily unavailable'),
          backgroundColor: AppTheme.error,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isTriggering = false);
      }
    }
  }

  void _showGeofenceError(String message) {
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Location Required'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              openAppSettings();
            },
            child: const Text('Open Settings'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = ref.watch(appStateProvider);

    if (appState.geofenceError != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (appState.geofenceError != null) {
          _showGeofenceError(appState.geofenceError!);
        }
      });
    }

    if (appState.geofencingActive) {
      if (!_pulseController.isAnimating) {
        _pulseController.repeat(reverse: true);
      }
    } else {
      _pulseController.stop();
    }

    if (appState.pendingConsentPayload != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final payload = appState.pendingConsentPayload;
        if (payload != null) {
          ref.read(appStateProvider.notifier).clearPendingConsent();
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => ConsentScreen(payload: payload),
            ),
          );
        }
      });
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('FreeSaleWiFi'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
                const SizedBox(height: 24),
                AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, child) {
                    final scale = appState.geofencingActive
                        ? 1.0 + (_pulseController.value * 0.15)
                        : 1.0;
                    final color = appState.geofencingActive
                        ? AppTheme.success
                        : AppTheme.error;

                    return Transform.scale(
                      scale: scale,
                      child: Icon(
                        Icons.wifi_tethering,
                        size: 120,
                        color: color,
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                Text(
                  appState.geofencingActive
                      ? 'Watching for FreeSaleWiFi...'
                      : 'Service inactive',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: appState.geofencingActive
                            ? AppTheme.success
                            : AppTheme.error,
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 32),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _InfoRow(
                          label: 'FCM Token',
                          value: _truncateToken(appState.fcmToken),
                        ),
                        const Divider(),
                        _InfoRow(
                          label: 'Store',
                          value: AppConfig.storeName,
                        ),
                        const Divider(),
                        _InfoRow(
                          label: 'Platform',
                          value: appState.platform,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _isTriggering ? null : _triggerTestPush,
                    icon: _isTriggering
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.notifications_active),
                    label: const Text('TEST: Trigger Push Now'),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: _openDashboard,
                    icon: const Icon(Icons.dashboard_outlined),
                    label: const Text('View Dashboard'),
                  ),
                ),
                if (appState.fcmToken == null || appState.fcmToken!.isEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 16),
                    child: Text(
                      'Notification permission required',
                      style: TextStyle(color: AppTheme.error),
                    ),
                  ),
              ],
            ),
          ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 90,
          child: Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ),
        Expanded(child: Text(value)),
      ],
    );
  }
}
