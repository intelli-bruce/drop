import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:drop_mobile/data/models/models.dart';
import 'package:drop_mobile/data/repositories/books_repository.dart';
import 'package:drop_mobile/data/services/book_search_service.dart';

part 'books_provider.g.dart';

/// Books list state
@riverpod
class BooksNotifier extends _$BooksNotifier {
  @override
  Future<List<Book>> build() async {
    final repository = ref.watch(booksRepositoryProvider);
    return repository.loadBooks();
  }

  /// Add a book from search result
  Future<Book?> addBookFromSearchResult(BookSearchResult result) async {
    final repository = ref.read(booksRepositoryProvider);

    // Check for duplicate
    final existing = await repository.findByIsbn(result.isbn13);
    if (existing != null) return existing;

    final book = await repository.addBook(
      isbn13: result.isbn13,
      title: result.title,
      author: result.author,
      publisher: result.publisher,
      pubDate: result.pubDate,
      description: result.description,
      coverUrl: result.coverImageUrl,
    );

    // Optimistic update
    state = AsyncData([book, ...(state.value ?? [])]);
    return book;
  }

  /// Update reading status
  Future<void> updateReadingStatus(
    String bookId,
    ReadingStatus status, {
    int? rating,
  }) async {
    final repository = ref.read(booksRepositoryProvider);

    // Optimistic update
    final current = state.value ?? [];
    state = AsyncData(current.map((b) {
      if (b.id == bookId) {
        return b.copyWith(
          readingStatus: status,
          startedAt: status == ReadingStatus.reading ? DateTime.now() : b.startedAt,
          finishedAt: status == ReadingStatus.completed ? DateTime.now() : b.finishedAt,
          rating: rating ?? b.rating,
        );
      }
      return b;
    }).toList());

    await repository.updateReadingStatus(bookId, status, rating: rating);
  }

  /// Update rating
  Future<void> updateRating(String bookId, int rating) async {
    final repository = ref.read(booksRepositoryProvider);

    state = AsyncData((state.value ?? []).map((b) {
      if (b.id == bookId) return b.copyWith(rating: rating);
      return b;
    }).toList());

    await repository.updateRating(bookId, rating);
  }

  /// Delete a book
  Future<void> deleteBook(String bookId) async {
    final repository = ref.read(booksRepositoryProvider);

    final current = state.value ?? [];
    final deletedBook = current.firstWhere((b) => b.id == bookId);
    state = AsyncData(current.where((b) => b.id != bookId).toList());

    try {
      await repository.deleteBook(bookId);
    } catch (e) {
      // Rollback on error
      state = AsyncData([deletedBook, ...(state.value ?? [])]);
      rethrow;
    }
  }

  /// Link a book to a note
  Future<void> linkBookToNote(String bookId, String noteId) async {
    final repository = ref.read(booksRepositoryProvider);
    await repository.linkBookToNote(bookId, noteId);
  }

  /// Unlink a book from a note
  Future<void> unlinkBookFromNote(String bookId, String noteId) async {
    final repository = ref.read(booksRepositoryProvider);
    await repository.unlinkBookFromNote(bookId, noteId);
  }
}

/// Book filter state
@riverpod
class BookFilterNotifier extends _$BookFilterNotifier {
  @override
  ReadingStatus? build() => null; // null = show all

  void setFilter(ReadingStatus? status) {
    state = status;
  }
}

/// Filtered books list
@riverpod
List<Book> filteredBooks(Ref ref) {
  final books = ref.watch(booksProvider).value ?? [];
  final filter = ref.watch(bookFilterProvider);

  if (filter == null) return books;
  return books.where((b) => b.readingStatus == filter).toList();
}

/// Book search state
@riverpod
class BookSearchNotifier extends _$BookSearchNotifier {
  final _service = BookSearchService();

  @override
  AsyncValue<List<BookSearchResult>> build() => const AsyncData([]);

  Future<void> search(String query) async {
    if (query.trim().isEmpty) {
      state = const AsyncData([]);
      return;
    }

    state = const AsyncLoading();
    try {
      final results = await _service.search(query);
      state = AsyncData(results);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  void clear() {
    state = const AsyncData([]);
  }
}

/// Get books linked to a specific note
@riverpod
Future<List<Book>> linkedBooks(Ref ref, String noteId) async {
  final repository = ref.watch(booksRepositoryProvider);
  return repository.getLinkedBooks(noteId);
}

/// Book counts by reading status
@riverpod
Map<ReadingStatus, int> bookCounts(Ref ref) {
  final books = ref.watch(booksProvider).value ?? [];
  return {
    ReadingStatus.toRead: books.where((b) => b.readingStatus == ReadingStatus.toRead).length,
    ReadingStatus.reading: books.where((b) => b.readingStatus == ReadingStatus.reading).length,
    ReadingStatus.completed: books.where((b) => b.readingStatus == ReadingStatus.completed).length,
  };
}
