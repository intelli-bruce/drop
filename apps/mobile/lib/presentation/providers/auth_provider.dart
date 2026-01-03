import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';

part 'auth_provider.g.dart';

@Riverpod(keepAlive: true)
class AuthNotifier extends _$AuthNotifier {
  StreamSubscription<AuthState>? _authSubscription;

  @override
  AsyncValue<User?> build() {
    final client = Supabase.instance.client;

    // Listen to auth state changes
    _authSubscription?.cancel();
    _authSubscription = client.auth.onAuthStateChange.listen((data) {
      state = AsyncData(data.session?.user);
    });

    ref.onDispose(() {
      _authSubscription?.cancel();
    });

    // Return current user
    return AsyncData(client.auth.currentUser);
  }

  Future<void> signInWithGoogle() async {
    state = const AsyncLoading();

    try {
      final client = Supabase.instance.client;

      // Native Google Sign-In
      // Client IDs are injected via --dart-define at build time
      const webClientId = String.fromEnvironment('GOOGLE_WEB_CLIENT_ID');
      const iosClientId = String.fromEnvironment('GOOGLE_IOS_CLIENT_ID');

      final googleSignIn = GoogleSignIn(
        clientId: iosClientId,
        serverClientId: webClientId,
      );

      final googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        // User cancelled
        state = const AsyncData(null);
        return;
      }

      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;
      final accessToken = googleAuth.accessToken;

      if (idToken == null) {
        throw Exception('Failed to get Google ID token');
      }

      final response = await client.auth.signInWithIdToken(
        provider: OAuthProvider.google,
        idToken: idToken,
        accessToken: accessToken,
      );

      state = AsyncData(response.user);
    } catch (e, st) {
      debugPrint('Google sign-in error: $e');
      state = AsyncError(e, st);
    }
  }

  Future<void> signOut() async {
    try {
      final client = Supabase.instance.client;
      await client.auth.signOut();

      // Also sign out from Google
      final googleSignIn = GoogleSignIn();
      await googleSignIn.signOut();

      state = const AsyncData(null);
    } catch (e, st) {
      debugPrint('Sign out error: $e');
      state = AsyncError(e, st);
    }
  }
}

@riverpod
bool isAuthenticated(Ref ref) {
  final authState = ref.watch(authProvider);
  return authState.value != null;
}

@riverpod
User? currentUser(Ref ref) {
  final authState = ref.watch(authProvider);
  return authState.value;
}
