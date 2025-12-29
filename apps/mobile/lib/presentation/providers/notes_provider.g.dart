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

String _$notesNotifierHash() => r'f8c0acb4dc46e338be51697269cd40aaba98fc55';

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

/// Provides notes grouped by date with thread depth

@ProviderFor(notesGroupedByDate)
const notesGroupedByDateProvider = NotesGroupedByDateProvider._();

/// Provides notes grouped by date with thread depth

final class NotesGroupedByDateProvider
    extends
        $FunctionalProvider<
          Map<String, List<NoteListItem>>,
          Map<String, List<NoteListItem>>,
          Map<String, List<NoteListItem>>
        >
    with $Provider<Map<String, List<NoteListItem>>> {
  /// Provides notes grouped by date with thread depth
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
  $ProviderElement<Map<String, List<NoteListItem>>> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  Map<String, List<NoteListItem>> create(Ref ref) {
    return notesGroupedByDate(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(Map<String, List<NoteListItem>> value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<Map<String, List<NoteListItem>>>(
        value,
      ),
    );
  }
}

String _$notesGroupedByDateHash() =>
    r'429f2e04fa2ff48eff0ea971e3cf1d0a926ad52a';
