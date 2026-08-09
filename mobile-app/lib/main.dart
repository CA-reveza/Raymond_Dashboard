import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'providers/app_provider.dart';
import 'screens/consent_screen.dart';
import 'screens/home_screen.dart';
import 'screens/onboarding_screen.dart';
import 'theme/app_theme.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
final GlobalKey<ScaffoldMessengerState> scaffoldMessengerKey =
    GlobalKey<ScaffoldMessengerState>();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase init error (add google-services.json): $e');
  }

  runApp(
    const ProviderScope(
      child: FreeSaleWiFiApp(),
    ),
  );
}

class FreeSaleWiFiApp extends ConsumerStatefulWidget {
  const FreeSaleWiFiApp({super.key});

  @override
  ConsumerState<FreeSaleWiFiApp> createState() => _FreeSaleWiFiAppState();
}

class _FreeSaleWiFiAppState extends ConsumerState<FreeSaleWiFiApp> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeApp();
    });
  }

  Future<void> _initializeApp() async {
    try {
      await ref.read(appStateProvider.notifier).initialize(
            onNotificationTap: _handleNotificationTap,
            onForegroundMessage: _handleForegroundMessage,
          );
    } catch (e) {
      debugPrint('App initialization error: $e');
    }
  }

  void _handleForegroundMessage(RemoteMessage message) {
    scaffoldMessengerKey.currentState?.showSnackBar(
      const SnackBar(
        content: Text('Push received!'),
        backgroundColor: AppTheme.success,
        duration: Duration(seconds: 3),
      ),
    );
  }

  void _handleNotificationTap(Map<String, dynamic> data) {
    final action = data['action']?.toString();
    if (action != 'wifi_connect') {
      return;
    }

    ref.read(appStateProvider.notifier).setPendingConsent(data);

    final context = navigatorKey.currentContext;
    if (context != null) {
      Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => ConsentScreen(payload: data),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = ref.watch(appStateProvider);

    Widget home;
    if (appState.isLoading) {
      home = const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    } else if (!appState.onboardingComplete) {
      home = const OnboardingScreen();
    } else {
      home = const HomeScreen();
    }

    return MaterialApp(
      navigatorKey: navigatorKey,
      scaffoldMessengerKey: scaffoldMessengerKey,
      title: 'FreeSaleWiFi',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: home,
      builder: (context, child) {
        return Stack(
          children: [
            child ?? const SizedBox.shrink(),
            if (appState.isWakingServer) const _ColdStartOverlay(),
          ],
        );
      },
    );
  }
}

class _ColdStartOverlay extends StatelessWidget {
  const _ColdStartOverlay();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black54,
      child: const Center(
        child: Card(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Waking up server...'),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
