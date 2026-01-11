import 'package:freezed_annotation/freezed_annotation.dart';

part 'book.freezed.dart';
part 'book.g.dart';

enum ReadingStatus {
  @JsonValue('to_read')
  toRead,
  @JsonValue('reading')
  reading,
  @JsonValue('completed')
  completed,
}

/// Database row type (snake_case)
@freezed
abstract class BookRow with _$BookRow {
  const factory BookRow({
    required String id,
    required String isbn13,
    required String title,
    required String author,
    String? publisher,
    @JsonKey(name: 'pub_date') String? pubDate,
    String? description,
    @JsonKey(name: 'cover_storage_path') String? coverStoragePath,
    @JsonKey(name: 'cover_url') String? coverUrl,
    @JsonKey(name: 'reading_status') required ReadingStatus readingStatus,
    @JsonKey(name: 'started_at') String? startedAt,
    @JsonKey(name: 'finished_at') String? finishedAt,
    int? rating,
    @JsonKey(name: 'created_at') required String createdAt,
    @JsonKey(name: 'updated_at') required String updatedAt,
  }) = _BookRow;

  factory BookRow.fromJson(Map<String, dynamic> json) => _$BookRowFromJson(json);
}

/// Application type (camelCase)
@freezed
abstract class Book with _$Book {
  const Book._();

  const factory Book({
    required String id,
    required String isbn13,
    required String title,
    required String author,
    String? publisher,
    String? pubDate,
    String? description,
    String? coverStoragePath,
    String? coverUrl,
    required ReadingStatus readingStatus,
    DateTime? startedAt,
    DateTime? finishedAt,
    int? rating,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Book;

  /// Convert from database row
  factory Book.fromRow(BookRow row) {
    return Book(
      id: row.id,
      isbn13: row.isbn13,
      title: row.title,
      author: row.author,
      publisher: row.publisher,
      pubDate: row.pubDate,
      description: row.description,
      coverStoragePath: row.coverStoragePath,
      coverUrl: row.coverUrl,
      readingStatus: row.readingStatus,
      startedAt: row.startedAt != null ? DateTime.parse(row.startedAt!) : null,
      finishedAt: row.finishedAt != null ? DateTime.parse(row.finishedAt!) : null,
      rating: row.rating,
      createdAt: DateTime.parse(row.createdAt),
      updatedAt: DateTime.parse(row.updatedAt),
    );
  }

  /// Reading status label in Korean
  String get readingStatusLabel => switch (readingStatus) {
    ReadingStatus.toRead => '읽을 예정',
    ReadingStatus.reading => '읽는 중',
    ReadingStatus.completed => '완독',
  };

  /// Rating as stars (1-5)
  String get ratingStars => rating != null
      ? '${'★' * rating!}${'☆' * (5 - rating!)}'
      : '';

  /// Get cover image URL (prefer storage path, fallback to cover_url)
  String? get coverImageUrl => coverStoragePath ?? coverUrl;
}
