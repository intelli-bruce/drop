import 'dart:async';
import 'package:app_links/app_links.dart';
import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'deep_link_provider.g.dart';

enum DeepLinkAction {
  none,
  record,
  memo,
  camera,
  gallery,
}

@immutable
class DeepLinkState {
  final DeepLinkAction action;
  final bool handled;

  const DeepLinkState({
    this.action = DeepLinkAction.none,
    this.handled = false,
  });

  DeepLinkState copyWith({
    DeepLinkAction? action,
    bool? handled,
  }) {
    return DeepLinkState(
      action: action ?? this.action,
      handled: handled ?? this.handled,
    );
  }
}

@riverpod
class DeepLink extends _$DeepLink {
  late final AppLinks _appLinks;
  StreamSubscription<Uri>? _subscription;

  @override
  DeepLinkState build() {
    _appLinks = AppLinks();
    _init();

    ref.onDispose(() {
      _subscription?.cancel();
    });

    return const DeepLinkState();
  }

  Future<void> _init() async {
    // Check initial link (app opened via deep link)
    final initialUri = await _appLinks.getInitialLink();
    if (initialUri != null) {
      debugPrint('[DeepLink] Initial URI: $initialUri');
      _handleUri(initialUri);
    }

    // Listen for incoming links while app is running
    _subscription = _appLinks.uriLinkStream.listen((uri) {
      debugPrint('[DeepLink] Stream URI: $uri');
      _handleUri(uri);
    });
  }

  void _handleUri(Uri uri) {
    // Only handle drop:// scheme, ignore others (e.g., sharemedia-*)
    if (uri.scheme != 'drop') {
      return;
    }

    debugPrint('[DeepLink] Handling URI: $uri');

    // Handle drop:// schemes
    switch (uri.host) {
      case 'record':
        state = const DeepLinkState(
          action: DeepLinkAction.record,
          handled: false,
        );
        break;
      case 'memo':
        state = const DeepLinkState(
          action: DeepLinkAction.memo,
          handled: false,
        );
        break;
      case 'camera':
        state = const DeepLinkState(
          action: DeepLinkAction.camera,
          handled: false,
        );
        break;
      case 'gallery':
        state = const DeepLinkState(
          action: DeepLinkAction.gallery,
          handled: false,
        );
        break;
    }
  }

  void markHandled() {
    if (state.action != DeepLinkAction.none && !state.handled) {
      state = state.copyWith(handled: true);
    }
  }

  void reset() {
    state = const DeepLinkState();
  }
}
