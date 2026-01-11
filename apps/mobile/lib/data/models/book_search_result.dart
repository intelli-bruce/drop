import 'package:freezed_annotation/freezed_annotation.dart';

part 'book_search_result.freezed.dart';
part 'book_search_result.g.dart';

enum BookSearchSource {
  aladin,
  naver,
  kakao,
  google,
}

@freezed
abstract class BookSearchResult with _$BookSearchResult {
  const BookSearchResult._();

  const factory BookSearchResult({
    required String isbn13,
    String? isbn10,
    required String title,
    required String author,
    required String publisher,
    String? pubDate,
    String? description,
    String? thumbnail,
    String? cover,
    required BookSearchSource source,
    String? sourceId,
    String? link,
    int? priceStandard,
    int? priceSales,
    String? category,
  }) = _BookSearchResult;

  factory BookSearchResult.fromJson(Map<String, dynamic> json) =>
      _$BookSearchResultFromJson(json);

  /// Get the best available cover image URL
  String? get coverImageUrl => cover ?? thumbnail;

  /// Source name in Korean
  String get sourceName => switch (source) {
    BookSearchSource.aladin => '알라딘',
    BookSearchSource.naver => '네이버',
    BookSearchSource.kakao => '카카오',
    BookSearchSource.google => 'Google',
  };

  /// Formatted price string
  String? get formattedPrice {
    final price = priceSales ?? priceStandard;
    if (price == null) return null;
    return '${_formatNumber(price)}원';
  }

  String _formatNumber(int number) {
    return number.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (match) => '${match[1]},',
    );
  }
}
