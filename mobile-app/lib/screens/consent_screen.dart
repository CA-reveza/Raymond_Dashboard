import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:layrz_wifi/layrz_wifi.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';
import '../providers/app_provider.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class ConsentScreen extends ConsumerStatefulWidget {
  const ConsentScreen({
    super.key,
    required this.payload,
  });

  final Map<String, dynamic> payload;

  @override
  ConsumerState<ConsentScreen> createState() => _ConsentScreenState();
}

class _ConsentScreenState extends ConsumerState<ConsentScreen> {
  bool _termsAccepted = false;
  bool _isConnecting = false;
  bool _isConnected = false;
  String _userName = '';
  String _userPhone = '';

  @override
  void initState() {
    super.initState();
    _loadUserDetails();
  }

  Future<void> _loadUserDetails() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      setState(() {
        _userName = prefs.getString(AppConfig.prefsUserName) ?? '';
        _userPhone = prefs.getString(AppConfig.prefsUserPhone) ?? '';
      });
    } catch (e) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load profile: $e')),
      );
    }
  }

  String get _storeName =>
      widget.payload['store_name']?.toString() ?? AppConfig.storeName;

  String get _storeId =>
      widget.payload['store_id']?.toString() ?? AppConfig.storeId;

  String get _wifiSsid =>
      widget.payload['ssid']?.toString() ?? AppConfig.wifiSsid;

  Future<void> _attemptWifiConnection() async {
    if (!Platform.isAndroid) {
      return;
    }

    try {
      final wifi = LayrzWifi.instance;
      if (!await wifi.hasCurrentSsid()) {
        return;
      }

      final current = await wifi.currentSsid();
      if (current == _wifiSsid) {
        return;
      }

      if (await wifi.hasDiscovery()) {
        await wifi.requestPermissions();
        await wifi.startScan();
        await Future<void>.delayed(const Duration(seconds: 2));
        await wifi.stopScan();
      }
    } catch (e) {
      debugPrint('WiFi connection attempt note: $e');
    }
  }

  Future<void> _connectInstantly() async {
    if (!_termsAccepted) {
      return;
    }

    setState(() => _isConnecting = true);

    try {
      final appState = ref.read(appStateProvider);
      final fcmToken = appState.fcmToken;

      if (fcmToken == null || fcmToken.isEmpty) {
        throw ApiException('Notification permission required');
      }

      final api = ref.read(apiServiceProvider);
      await api.connectConsent(
        fcmToken: fcmToken,
        storeId: _storeId,
        userId: appState.userId,
        consent: true,
        wifiSsid: _wifiSsid,
        onLoadingState: (waking) {
          ref.read(appStateProvider.notifier).setWakingServer(waking);
        },
      );

      await _attemptWifiConnection();

      if (!mounted) {
        return;
      }

      setState(() {
        _isConnecting = false;
        _isConnected = true;
      });
    } on ApiException catch (e) {
      if (!mounted) {
        return;
      }
      setState(() => _isConnecting = false);
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
      setState(() => _isConnecting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Service temporarily unavailable'),
          backgroundColor: AppTheme.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('FreeSaleWiFi|'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: _isConnected ? _buildSuccessView() : _buildConsentForm(),
      ),
    );
  }

  Widget _buildSuccessView() {
    return Column(
      children: [
        const SizedBox(height: 48),
        const Icon(
          Icons.check_circle,
          color: AppTheme.success,
          size: 96,
        ),
        const SizedBox(height: 24),
        Text(
          'Connected! Enjoy free WiFi.',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: AppTheme.success,
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 16),
        Text(
          'Join network "$_wifiSsid" from your WiFi settings if not connected automatically.',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        const SizedBox(height: 32),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Done'),
          ),
        ),
      ],
    );
  }

  Widget _buildConsentForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _DetailRow(icon: Icons.person, text: _userName),
                const Divider(),
                _DetailRow(icon: Icons.phone, text: _userPhone),
                const Divider(),
                _DetailRow(icon: Icons.store, text: _storeName),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        CheckboxListTile(
          value: _termsAccepted,
          onChanged: _isConnecting
              ? null
              : (value) {
                  setState(() => _termsAccepted = value ?? false);
                },
          title: const Text(
            'I agree to the terms of service and data collection',
          ),
          controlAffinity: ListTileControlAffinity.leading,
        ),
        if (!_termsAccepted)
          Padding(
            padding: const EdgeInsets.only(left: 16, top: 4),
            child: Text(
              'Please accept the terms to enable connection',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey.shade600,
                  ),
            ),
          ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: _termsAccepted && !_isConnecting ? _connectInstantly : null,
          style: ElevatedButton.styleFrom(
            disabledBackgroundColor: Colors.grey.shade300,
            disabledForegroundColor: Colors.grey.shade600,
          ),
          child: _isConnecting
              ? const SizedBox(
                  height: 22,
                  width: 22,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Text('CONNECT INSTANTLY'),
        ),
      ],
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.primary),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text.isEmpty ? '—' : text,
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ),
      ],
    );
  }
}
