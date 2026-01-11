// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'books_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Books list state

@ProviderFor(BooksNotifier)
const booksProvider = BooksNotifierProvider._();

/// Books list state
final class BooksNotifierProvider
    extends $AsyncNotifierProvider<BooksNotifier, List<Book>> {
  /// Books list state
  const BooksNotifierProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'booksProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$booksNotifierHash();

  @$internal
  @override
  BooksNotifier create() => BooksNotifier();
}

String _$booksNotifierHash() => r'be93c54232fa9b806f926f61b1587bbbb8ba364b';

/// Books list state

abstract class _$BooksNotifier extends $AsyncNotifier<List<Book>> {
  FutureOr<List<Book>> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<AsyncValue<List<Book>>, List<Book>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<List<Book>>, List<Book>>,
              AsyncValue<List<Book>>,
              Object?,
              Object?
            >;
    element.handleValue(ref, created);
  }
}

/// Book filter state

@ProviderFor(BookFilterNotifier)
const bookFilterProvider = BookFilterNotifierProvider._();

/// Book filter state
final class BookFilterNotifierProvider
    extends $NotifierProvider<BookFilterNotifier, ReadingStatus?> {
  /// Book filter state
  const BookFilterNotifierProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'bookFilterProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$bookFilterNotifierHash();

  @$internal
  @override
  BookFilterNotifier create() => BookFilterNotifier();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(ReadingStatus? value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<ReadingStatus?>(value),
    );
  }
}

String _$bookFilterNotifierHash() =>
    r'32a2bd98f1251d3fe11046a85d4b1b35d3bbadef';

/// Book filter state

abstract class _$BookFilterNotifier extends $Notifier<ReadingStatus?> {
  ReadingStatus? build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<ReadingStatus?, ReadingStatus?>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<ReadingStatus?, ReadingStatus?>,
              ReadingStatus?,
              Object?,
              Object?
            >;
    element.handleValue(ref, created);
  }
}

/// Filtered books list

@ProviderFor(filteredBooks)
const filteredBooksProvider = FilteredBooksProvider._();

/// Filtered books list

final class FilteredBooksProvider
    extends $FunctionalProvider<List<Book>, List<Book>, List<Book>>
    with $Provider<List<Book>> {
  /// Filtered books list
  const FilteredBooksProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'filteredBooksProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$filteredBooksHash();

  @$internal
  @override
  $ProviderElement<List<Book>> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  List<Book> create(Ref ref) {
    return filteredBooks(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(List<Book> value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<List<Book>>(value),
    );
  }
}

String _$filteredBooksHash() => r'5f63604fdde9a26ebfe5fc577e75009b3a4dc4e1';

/// Book search state

@ProviderFor(BookSearchNotifier)
const bookSearchProvider = BookSearchNotifierProvider._();

/// Book search state
final class BookSearchNotifierProvider
    extends
        $NotifierProvider<
          BookSearchNotifier,
          AsyncValue<List<BookSearchResult>>
        > {
  /// Book search state
  const BookSearchNotifierProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'bookSearchProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$bookSearchNotifierHash();

  @$internal
  @override
  BookSearchNotifier create() => BookSearchNotifier();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(AsyncValue<List<BookSearchResult>> value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<AsyncValue<List<BookSearchResult>>>(
        value,
      ),
    );
  }
}

String _$bookSearchNotifierHash() =>
    r'597e3ca02fc46f609a8a7f725561c43f4c554d16';

/// Book search state

abstract class _$BookSearchNotifier
    extends $Notifier<AsyncValue<List<BookSearchResult>>> {
  AsyncValue<List<BookSearchResult>> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref =
        this.ref
            as $Ref<
              AsyncValue<List<BookSearchResult>>,
              AsyncValue<List<BookSearchResult>>
            >;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<
                AsyncValue<List<BookSearchResult>>,
                AsyncValue<List<BookSearchResult>>
              >,
              AsyncValue<List<BookSearchResult>>,
              Object?,
              Object?
            >;
    element.handleValue(ref, created);
  }
}

/// Get books linked to a specific note

@ProviderFor(linkedBooks)
const linkedBooksProvider = LinkedBooksFamily._();

/// Get books linked to a specific note

final class LinkedBooksProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<Book>>,
          List<Book>,
          FutureOr<List<Book>>
        >
    with $FutureModifier<List<Book>>, $FutureProvider<List<Book>> {
  /// Get books linked to a specific note
  const LinkedBooksProvider._({
    required LinkedBooksFamily super.from,
    required String super.argument,
  }) : super(
         retry: null,
         name: r'linkedBooksProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$linkedBooksHash();

  @override
  String toString() {
    return r'linkedBooksProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  $FutureProviderElement<List<Book>> $createElement($ProviderPointer pointer) =>
      $FutureProviderElement(pointer);

  @override
  FutureOr<List<Book>> create(Ref ref) {
    final argument = this.argument as String;
    return linkedBooks(ref, argument);
  }

  @override
  bool operator ==(Object other) {
    return other is LinkedBooksProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$linkedBooksHash() => r'e61b7330efe23cd901e258933b4be0afb01fa3b1';

/// Get books linked to a specific note

final class LinkedBooksFamily extends $Family
    with $FunctionalFamilyOverride<FutureOr<List<Book>>, String> {
  const LinkedBooksFamily._()
    : super(
        retry: null,
        name: r'linkedBooksProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  /// Get books linked to a specific note

  LinkedBooksProvider call(String noteId) =>
      LinkedBooksProvider._(argument: noteId, from: this);

  @override
  String toString() => r'linkedBooksProvider';
}

/// Book counts by reading status

@ProviderFor(bookCounts)
const bookCountsProvider = BookCountsProvider._();

/// Book counts by reading status

final class BookCountsProvider
    extends
        $FunctionalProvider<
          Map<ReadingStatus, int>,
          Map<ReadingStatus, int>,
          Map<ReadingStatus, int>
        >
    with $Provider<Map<ReadingStatus, int>> {
  /// Book counts by reading status
  const BookCountsProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'bookCountsProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$bookCountsHash();

  @$internal
  @override
  $ProviderElement<Map<ReadingStatus, int>> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  Map<ReadingStatus, int> create(Ref ref) {
    return bookCounts(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(Map<ReadingStatus, int> value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<Map<ReadingStatus, int>>(value),
    );
  }
}

String _$bookCountsHash() => r'559143170aa09771f9e708e668325ad57159c981';
