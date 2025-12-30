import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Supabase configuration
///
/// Environment variables should be set via:
/// - flutter run --dart-define=SUPABASE_URL=xxx --dart-define=SUPABASE_ANON_KEY=xxx
/// - Or via .env file with flutter_dotenv (optional)
class SupabaseConfig {
  static const String url = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'http://127.0.0.1:58321',
  );

  static const String anonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: '',
  );

  /// Initialize Supabase
  static Future<void> initialize() async {
    if (anonKey.isEmpty) {
      if (kDebugMode) {
        print('Warning: SUPABASE_ANON_KEY is not set');
      }
    }

    await Supabase.initialize(
      url: url,
      anonKey: anonKey,
      debug: kDebugMode,
    );
  }

  /// Get Supabase client instance
  static SupabaseClient get client => Supabase.instance.client;
}
