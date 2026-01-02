// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'deep_link_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(DeepLink)
const deepLinkProvider = DeepLinkProvider._();

final class DeepLinkProvider
    extends $NotifierProvider<DeepLink, DeepLinkState> {
  const DeepLinkProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'deepLinkProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$deepLinkHash();

  @$internal
  @override
  DeepLink create() => DeepLink();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(DeepLinkState value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<DeepLinkState>(value),
    );
  }
}

String _$deepLinkHash() => r'6ea7d18530bd3c0a5ae5425e0dfc47e6bc21f6ea';

abstract class _$DeepLink extends $Notifier<DeepLinkState> {
  DeepLinkState build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<DeepLinkState, DeepLinkState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<DeepLinkState, DeepLinkState>,
              DeepLinkState,
              Object?,
              Object?
            >;
    element.handleValue(ref, created);
  }
}
