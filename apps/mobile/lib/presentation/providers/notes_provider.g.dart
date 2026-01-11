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

String _$notesNotifierHash() => r'7668a30a9641f5b7bf63852c8a5e0d979c8ac803';

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

/// Current view mode state

@ProviderFor(ViewModeNotifier)
const viewModeProvider = ViewModeNotifierProvider._();

/// Current view mode state
final class ViewModeNotifierProvider
    extends $NotifierProvider<ViewModeNotifier, NoteViewMode> {
  /// Current view mode state
  const ViewModeNotifierProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'viewModeProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$viewModeNotifierHash();

  @$internal
  @override
  ViewModeNotifier create() => ViewModeNotifier();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(NoteViewMode value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<NoteViewMode>(value),
    );
  }
}

String _$viewModeNotifierHash() => r'e39c80f3bf21fe08efdea6cb9cd0d11a6c0839d8';

/// Current view mode state

abstract class _$ViewModeNotifier extends $Notifier<NoteViewMode> {
  NoteViewMode build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<NoteViewMode, NoteViewMode>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<NoteViewMode, NoteViewMode>,
              NoteViewMode,
              Object?,
              Object?
            >;
    element.handleValue(ref, created);
  }
}

/// Current category filter state

@ProviderFor(CategoryFilterNotifier)
const categoryFilterProvider = CategoryFilterNotifierProvider._();

/// Current category filter state
final class CategoryFilterNotifierProvider
    extends $NotifierProvider<CategoryFilterNotifier, NoteCategory> {
  /// Current category filter state
  const CategoryFilterNotifierProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'categoryFilterProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$categoryFilterNotifierHash();

  @$internal
  @override
  CategoryFilterNotifier create() => CategoryFilterNotifier();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(NoteCategory value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<NoteCategory>(value),
    );
  }
}

String _$categoryFilterNotifierHash() =>
    r'b8fbfdd31651bc3899dce867862d1081f6801efa';

/// Current category filter state

abstract class _$CategoryFilterNotifier extends $Notifier<NoteCategory> {
  NoteCategory build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<NoteCategory, NoteCategory>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<NoteCategory, NoteCategory>,
              NoteCategory,
              Object?,
              Object?
            >;
    element.handleValue(ref, created);
  }
}

/// Provides filtered notes based on view mode and category

@ProviderFor(filteredNotes)
const filteredNotesProvider = FilteredNotesProvider._();

/// Provides filtered notes based on view mode and category

final class FilteredNotesProvider
    extends $FunctionalProvider<List<Note>, List<Note>, List<Note>>
    with $Provider<List<Note>> {
  /// Provides filtered notes based on view mode and category
  const FilteredNotesProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'filteredNotesProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$filteredNotesHash();

  @$internal
  @override
  $ProviderElement<List<Note>> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  List<Note> create(Ref ref) {
    return filteredNotes(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(List<Note> value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<List<Note>>(value),
    );
  }
}

String _$filteredNotesHash() => r'b0e00984b5942453b0a794b7b705d4e745133362';

/// Provides filtered notes grouped by date with thread depth

@ProviderFor(filteredNotesGroupedByDate)
const filteredNotesGroupedByDateProvider =
    FilteredNotesGroupedByDateProvider._();

/// Provides filtered notes grouped by date with thread depth

final class FilteredNotesGroupedByDateProvider
    extends
        $FunctionalProvider<
          Map<String, List<NoteListItem>>,
          Map<String, List<NoteListItem>>,
          Map<String, List<NoteListItem>>
        >
    with $Provider<Map<String, List<NoteListItem>>> {
  /// Provides filtered notes grouped by date with thread depth
  const FilteredNotesGroupedByDateProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'filteredNotesGroupedByDateProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$filteredNotesGroupedByDateHash();

  @$internal
  @override
  $ProviderElement<Map<String, List<NoteListItem>>> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  Map<String, List<NoteListItem>> create(Ref ref) {
    return filteredNotesGroupedByDate(ref);
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

String _$filteredNotesGroupedByDateHash() =>
    r'603e5305e1db9bc1b1d29b9f5d1c592699468313';

/// Count of notes in trash

@ProviderFor(trashCount)
const trashCountProvider = TrashCountProvider._();

/// Count of notes in trash

final class TrashCountProvider extends $FunctionalProvider<int, int, int>
    with $Provider<int> {
  /// Count of notes in trash
  const TrashCountProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'trashCountProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$trashCountHash();

  @$internal
  @override
  $ProviderElement<int> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  int create(Ref ref) {
    return trashCount(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(int value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<int>(value),
    );
  }
}

String _$trashCountHash() => r'60937b81ad0a5599d44a1091ffbd1a16bb867bc7';

/// Count of archived notes

@ProviderFor(archivedCount)
const archivedCountProvider = ArchivedCountProvider._();

/// Count of archived notes

final class ArchivedCountProvider extends $FunctionalProvider<int, int, int>
    with $Provider<int> {
  /// Count of archived notes
  const ArchivedCountProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'archivedCountProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$archivedCountHash();

  @$internal
  @override
  $ProviderElement<int> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  int create(Ref ref) {
    return archivedCount(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(int value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<int>(value),
    );
  }
}

String _$archivedCountHash() => r'a2a0b1648392d762deb5a8ec9c2a5813c937d08f';

/// Session-based unlocked notes (cleared when app restarts)

@ProviderFor(UnlockedNotesNotifier)
const unlockedNotesProvider = UnlockedNotesNotifierProvider._();

/// Session-based unlocked notes (cleared when app restarts)
final class UnlockedNotesNotifierProvider
    extends $NotifierProvider<UnlockedNotesNotifier, Set<String>> {
  /// Session-based unlocked notes (cleared when app restarts)
  const UnlockedNotesNotifierProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'unlockedNotesProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$unlockedNotesNotifierHash();

  @$internal
  @override
  UnlockedNotesNotifier create() => UnlockedNotesNotifier();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(Set<String> value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<Set<String>>(value),
    );
  }
}

String _$unlockedNotesNotifierHash() =>
    r'6273caeeac8f339be11a375e07abd824e2e4252a';

/// Session-based unlocked notes (cleared when app restarts)

abstract class _$UnlockedNotesNotifier extends $Notifier<Set<String>> {
  Set<String> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<Set<String>, Set<String>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<Set<String>, Set<String>>,
              Set<String>,
              Object?,
              Object?
            >;
    element.handleValue(ref, created);
  }
}
