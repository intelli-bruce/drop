import 'dart:async';
import 'package:app_links/app_links.dart';
import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'deep_link_provider.g.dart';

enum DeepLinkAction {
  none,
  record,
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
    debugPrint('[DeepLink] Handling URI: $uri');

    // Handle drop://record
    if (uri.scheme == 'drop' && uri.host == 'record') {
      state = const DeepLinkState(
        action: DeepLinkAction.record,
        handled: false,
      );
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
