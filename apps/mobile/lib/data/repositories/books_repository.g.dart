// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'books_repository.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(booksRepository)
const booksRepositoryProvider = BooksRepositoryProvider._();

final class BooksRepositoryProvider
    extends
        $FunctionalProvider<BooksRepository, BooksRepository, BooksRepository>
    with $Provider<BooksRepository> {
  const BooksRepositoryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'booksRepositoryProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$booksRepositoryHash();

  @$internal
  @override
  $ProviderElement<BooksRepository> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  BooksRepository create(Ref ref) {
    return booksRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(BooksRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<BooksRepository>(value),
    );
  }
}

String _$booksRepositoryHash() => r'2561074437ab1bd875d7b66bbafc025426530432';
