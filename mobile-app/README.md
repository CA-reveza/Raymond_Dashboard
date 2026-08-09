# AXIONIK Frontend — Flutter Mobile App

> In-store WiFi consent and push notification app for iOS and Android.

## Setup

```bash
flutter pub get
flutter run
```

## Project Structure

```
lib/
├── main.dart                  ← App entry point, FCM setup
├── config/
│   └── app_config.dart        ← API URLs and app constants
├── providers/
│   └── app_provider.dart      ← Riverpod state management
├── screens/
│   ├── onboarding_screen.dart ← First-time setup flow
│   ├── consent_screen.dart    ← WiFi consent gate
│   └── home_screen.dart       ← Main dashboard view
├── services/
│   ├── api_service.dart       ← HTTP client for backend REST API
│   ├── geofence_service.dart  ← Location-based auto-connect
│   ├── notification_service.dart ← FCM push handler
│   └── isolate_token_bridge.dart ← Background isolate token refresh
└── theme/
    └── app_theme.dart         ← App colors, typography, ThemeData
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `flutter_riverpod` | State management |
| `firebase_messaging` | FCM push notifications |
| `geofence_foreground_service` | In-store geofence detection |
| `http` | REST API calls to backend |
| `permission_handler` | Location & notification permissions |
| `shared_preferences` | Local persistence |

## Backend Connection

Update `lib/config/app_config.dart` with your backend URL:

```dart
static const String apiBaseUrl = 'https://axionik-api.onrender.com';
```
