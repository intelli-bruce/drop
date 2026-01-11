import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:drop_mobile/data/models/models.dart';
import 'package:drop_mobile/data/providers/supabase_provider.dart';

part 'books_repository.g.dart';

@Riverpod(keepAlive: true)
BooksRepository booksRepository(Ref ref) {
  return BooksRepository(ref.watch(supabaseClientProvider));
}

class BooksRepository {
  final SupabaseClient _client;

  BooksRepository(this._client);

  /// Load all books for the current user
  Future<List<Book>> loadBooks() async {
    final data = await _client
        .from('books')
        .select()
        .order('created_at', ascending: false);

    return (data as List)
        .map((row) => Book.fromRow(BookRow.fromJson(row)))
        .toList();
  }

  /// Add a new book to the library
  Future<Book> addBook({
    required String isbn13,
    required String title,
    required String author,
    String? publisher,
    String? pubDate,
    String? description,
    String? coverStoragePath,
    String? coverUrl,
  }) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    final data = await _client
        .from('books')
        .insert({
          'user_id': user.id,
          'isbn13': isbn13,
          'title': title,
          'author': author,
          'publisher': publisher,
          'pub_date': pubDate,
          'description': description,
          'cover_storage_path': coverStoragePath,
          'cover_url': coverUrl,
          'reading_status': 'to_read',
        })
        .select()
        .single();

    return Book.fromRow(BookRow.fromJson(data));
  }

  /// Find a book by ISBN (for duplicate check)
  Future<Book?> findByIsbn(String isbn13) async {
    final data = await _client
        .from('books')
        .select()
        .eq('isbn13', isbn13)
        .maybeSingle();

    if (data == null) return null;
    return Book.fromRow(BookRow.fromJson(data));
  }

  /// Update reading status
  Future<void> updateReadingStatus(
    String bookId,
    ReadingStatus status, {
    int? rating,
  }) async {
    final updates = <String, dynamic>{'reading_status': status.name};

    // Set timestamps based on status
    if (status == ReadingStatus.reading) {
      updates['started_at'] = DateTime.now().toUtc().toIso8601String();
    } else if (status == ReadingStatus.completed) {
      updates['finished_at'] = DateTime.now().toUtc().toIso8601String();
      if (rating != null) updates['rating'] = rating;
    }

    await _client.from('books').update(updates).eq('id', bookId);
  }

  /// Update book rating (1-5)
  Future<void> updateRating(String bookId, int rating) async {
    await _client.from('books').update({
      'rating': rating.clamp(1, 5),
    }).eq('id', bookId);
  }

  /// Delete a book from the library
  Future<void> deleteBook(String bookId) async {
    await _client.from('books').delete().eq('id', bookId);
  }

  /// Link a book to a note
  Future<void> linkBookToNote(String bookId, String noteId) async {
    await _client.from('book_notes').insert({
      'book_id': bookId,
      'note_id': noteId,
    });
  }

  /// Unlink a book from a note
  Future<void> unlinkBookFromNote(String bookId, String noteId) async {
    await _client
        .from('book_notes')
        .delete()
        .eq('book_id', bookId)
        .eq('note_id', noteId);
  }

  /// Get books linked to a specific note
  Future<List<Book>> getLinkedBooks(String noteId) async {
    final bookNotes = await _client
        .from('book_notes')
        .select('book_id')
        .eq('note_id', noteId);

    if (bookNotes.isEmpty) return [];

    final bookIds = (bookNotes as List).map((bn) => bn['book_id']).toList();

    final books = await _client
        .from('books')
        .select()
        .inFilter('id', bookIds);

    return (books as List)
        .map((row) => Book.fromRow(BookRow.fromJson(row)))
        .toList();
  }

  /// Get note IDs linked to a specific book
  Future<List<String>> getLinkedNoteIds(String bookId) async {
    final bookNotes = await _client
        .from('book_notes')
        .select('note_id')
        .eq('book_id', bookId);

    return (bookNotes as List)
        .map((bn) => bn['note_id'] as String)
        .toList();
  }

  /// Get a single book by ID
  Future<Book?> getBook(String bookId) async {
    final data = await _client
        .from('books')
        .select()
        .eq('id', bookId)
        .maybeSingle();

    if (data == null) return null;
    return Book.fromRow(BookRow.fromJson(data));
  }

  /// Get signed URL for book cover from storage
  Future<String> getCoverSignedUrl(String storagePath, {int expiresIn = 3600}) async {
    final response = await _client.storage
        .from('books')
        .createSignedUrl(storagePath, expiresIn);
    return response;
  }
}
