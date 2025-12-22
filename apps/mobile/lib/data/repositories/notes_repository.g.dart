// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notes_repository.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(notesRepository)
const notesRepositoryProvider = NotesRepositoryProvider._();

final class NotesRepositoryProvider
    extends
        $FunctionalProvider<NotesRepository, NotesRepository, NotesRepository>
    with $Provider<NotesRepository> {
  const NotesRepositoryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'notesRepositoryProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$notesRepositoryHash();

  @$internal
  @override
  $ProviderElement<NotesRepository> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  NotesRepository create(Ref ref) {
    return notesRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(NotesRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<NotesRepository>(value),
    );
  }
}

String _$notesRepositoryHash() => r'732b61bb0a0af03f04ec9718ffec757fb6d511a0';
