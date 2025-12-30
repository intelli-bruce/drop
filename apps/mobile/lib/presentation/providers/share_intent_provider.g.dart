// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'share_intent_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Provider for handling shared content from iOS Share Extension

@ProviderFor(ShareIntent)
const shareIntentProvider = ShareIntentProvider._();

/// Provider for handling shared content from iOS Share Extension
final class ShareIntentProvider
    extends $NotifierProvider<ShareIntent, SharedContent> {
  /// Provider for handling shared content from iOS Share Extension
  const ShareIntentProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'shareIntentProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$shareIntentHash();

  @$internal
  @override
  ShareIntent create() => ShareIntent();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(SharedContent value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<SharedContent>(value),
    );
  }
}

String _$shareIntentHash() => r'fe6af9cac15507b5967f6650b89d45b56b86eb24';

/// Provider for handling shared content from iOS Share Extension

abstract class _$ShareIntent extends $Notifier<SharedContent> {
  SharedContent build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<SharedContent, SharedContent>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<SharedContent, SharedContent>,
              SharedContent,
              Object?,
              Object?
            >;
    element.handleValue(ref, created);
  }
}

/// Provider to check if there's pending shared content

@ProviderFor(hasSharedContent)
const hasSharedContentProvider = HasSharedContentProvider._();

/// Provider to check if there's pending shared content

final class HasSharedContentProvider
    extends $FunctionalProvider<bool, bool, bool>
    with $Provider<bool> {
  /// Provider to check if there's pending shared content
  const HasSharedContentProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'hasSharedContentProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$hasSharedContentHash();

  @$internal
  @override
  $ProviderElement<bool> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  bool create(Ref ref) {
    return hasSharedContent(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(bool value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<bool>(value),
    );
  }
}

String _$hasSharedContentHash() => r'9f07e47499b925a91b5629619cc75136ccf0b221';
