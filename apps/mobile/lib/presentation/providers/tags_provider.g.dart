// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'tags_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(TagsNotifier)
const tagsProvider = TagsNotifierProvider._();

final class TagsNotifierProvider
    extends $AsyncNotifierProvider<TagsNotifier, List<TagWithCount>> {
  const TagsNotifierProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'tagsProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$tagsNotifierHash();

  @$internal
  @override
  TagsNotifier create() => TagsNotifier();
}

String _$tagsNotifierHash() => r'71c97e1fafa5d8eec76756827eb5e347dcf84b4b';

abstract class _$TagsNotifier extends $AsyncNotifier<List<TagWithCount>> {
  FutureOr<List<TagWithCount>> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref =
        this.ref as $Ref<AsyncValue<List<TagWithCount>>, List<TagWithCount>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<List<TagWithCount>>, List<TagWithCount>>,
              AsyncValue<List<TagWithCount>>,
              Object?,
              Object?
            >;
    element.handleValue(ref, created);
  }
}

/// Provides all tags ordered by last_used_at (for tag selector)

@ProviderFor(allTags)
const allTagsProvider = AllTagsProvider._();

/// Provides all tags ordered by last_used_at (for tag selector)

final class AllTagsProvider
    extends $FunctionalProvider<List<Tag>, List<Tag>, List<Tag>>
    with $Provider<List<Tag>> {
  /// Provides all tags ordered by last_used_at (for tag selector)
  const AllTagsProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'allTagsProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$allTagsHash();

  @$internal
  @override
  $ProviderElement<List<Tag>> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  List<Tag> create(Ref ref) {
    return allTags(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(List<Tag> value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<List<Tag>>(value),
    );
  }
}

String _$allTagsHash() => r'b4c0d8a5fbf2cd6c53d71e2b58f5fedf49aaa1b6';
