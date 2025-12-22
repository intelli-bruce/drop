// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notes_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(NotesNotifier)
const notesProvider = NotesNotifierProvider._();

final class NotesNotifierProvider
    extends $AsyncNotifierProvider<NotesNotifier, List<Note>> {
  const NotesNotifierProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'notesProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$notesNotifierHash();

  @$internal
  @override
  NotesNotifier create() => NotesNotifier();
}

String _$notesNotifierHash() => r'45ac7ff4ac0c284fb8bc76cd92418fff9edc36ae';

abstract class _$NotesNotifier extends $AsyncNotifier<List<Note>> {
  FutureOr<List<Note>> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<AsyncValue<List<Note>>, List<Note>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<List<Note>>, List<Note>>,
              AsyncValue<List<Note>>,
              Object?,
              Object?
            >;
    element.handleValue(ref, created);
  }
}

/// Provides notes grouped by date

@ProviderFor(notesGroupedByDate)
const notesGroupedByDateProvider = NotesGroupedByDateProvider._();

/// Provides notes grouped by date

final class NotesGroupedByDateProvider
    extends
        $FunctionalProvider<
          Map<String, List<Note>>,
          Map<String, List<Note>>,
          Map<String, List<Note>>
        >
    with $Provider<Map<String, List<Note>>> {
  /// Provides notes grouped by date
  const NotesGroupedByDateProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'notesGroupedByDateProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$notesGroupedByDateHash();

  @$internal
  @override
  $ProviderElement<Map<String, List<Note>>> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  Map<String, List<Note>> create(Ref ref) {
    return notesGroupedByDate(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(Map<String, List<Note>> value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<Map<String, List<Note>>>(value),
    );
  }
}

String _$notesGroupedByDateHash() =>
    r'78f763466fe16dae392062bc9c0731a63eec1644';
