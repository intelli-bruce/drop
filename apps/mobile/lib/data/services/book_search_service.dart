import 'package:dio/dio.dart';
import 'package:drop_mobile/data/models/models.dart';
import 'package:drop_mobile/core/config/secrets.dart';

class BookSearchService {
  final Dio _dio = Dio();

  /// Unified search across multiple book APIs
  /// Returns merged results with duplicates removed (by ISBN13)
  Future<List<BookSearchResult>> search(String query) async {
    if (query.trim().isEmpty) return [];

    final results = <BookSearchResult>[];
    final isbnSet = <String>{}; // For duplicate removal

    // Parallel API calls
    final futures = await Future.wait([
      _searchAladin(query).catchError((_) => <BookSearchResult>[]),
      _searchNaver(query).catchError((_) => <BookSearchResult>[]),
      _searchKakao(query).catchError((_) => <BookSearchResult>[]),
    ]);

    // Merge results: Aladin > Naver > Kakao priority
    for (final list in futures) {
      for (final item in list) {
        if (item.isbn13.isNotEmpty && !isbnSet.contains(item.isbn13)) {
          isbnSet.add(item.isbn13);
          results.add(item);
        }
      }
    }

    return results.take(30).toList();
  }

  /// Search Aladin API (primary source for Korean books)
  Future<List<BookSearchResult>> _searchAladin(String query) async {
    if (Secrets.aladinTTBKey.isEmpty) return [];

    final response = await _dio.get(
      'https://www.aladin.co.kr/ttb/api/ItemSearch.aspx',
      queryParameters: {
        'ttbkey': Secrets.aladinTTBKey,
        'Query': query,
        'QueryType': 'Keyword',
        'MaxResults': 20,
        'start': 1,
        'SearchTarget': 'Book',
        'output': 'js',
        'Version': '20131101',
      },
    );

    final items = response.data['item'] as List? ?? [];
    return items.map((item) => BookSearchResult(
      isbn13: item['isbn13']?.toString() ?? '',
      isbn10: item['isbn']?.toString(),
      title: item['title']?.toString() ?? '',
      author: item['author']?.toString() ?? '',
      publisher: item['publisher']?.toString() ?? '',
      pubDate: item['pubDate']?.toString(),
      description: item['description']?.toString(),
      thumbnail: item['cover']?.toString(),
      cover: item['cover']?.toString(),
      source: BookSearchSource.aladin,
      sourceId: item['itemId']?.toString(),
      link: item['link']?.toString(),
      priceStandard: item['priceStandard'] as int?,
      priceSales: item['priceSales'] as int?,
      category: item['categoryName']?.toString(),
    )).where((r) => r.isbn13.isNotEmpty).toList();
  }

  /// Search Naver Books API
  Future<List<BookSearchResult>> _searchNaver(String query) async {
    if (Secrets.naverClientId.isEmpty || Secrets.naverClientSecret.isEmpty) {
      return [];
    }

    final response = await _dio.get(
      'https://openapi.naver.com/v1/search/book.json',
      queryParameters: {
        'query': query,
        'display': 20,
        'start': 1,
      },
      options: Options(headers: {
        'X-Naver-Client-Id': Secrets.naverClientId,
        'X-Naver-Client-Secret': Secrets.naverClientSecret,
      }),
    );

    final items = response.data['items'] as List? ?? [];
    return items.map((item) {
      final isbnParts = (item['isbn'] as String? ?? '').split(' ');
      return BookSearchResult(
        isbn13: isbnParts.length > 1 ? isbnParts[1] : (isbnParts.isNotEmpty ? isbnParts.first : ''),
        isbn10: isbnParts.isNotEmpty ? isbnParts.first : null,
        title: _stripHtml(item['title']?.toString() ?? ''),
        author: _stripHtml(item['author']?.toString() ?? ''),
        publisher: item['publisher']?.toString() ?? '',
        pubDate: _formatNaverDate(item['pubdate']?.toString()),
        description: _stripHtml(item['description']?.toString()),
        thumbnail: item['image']?.toString(),
        cover: item['image']?.toString(),
        source: BookSearchSource.naver,
        link: item['link']?.toString(),
        priceSales: int.tryParse(item['discount']?.toString() ?? ''),
      );
    }).where((r) => r.isbn13.isNotEmpty).toList();
  }

  /// Search Kakao Books API
  Future<List<BookSearchResult>> _searchKakao(String query) async {
    if (Secrets.kakaoRestApiKey.isEmpty) return [];

    final response = await _dio.get(
      'https://dapi.kakao.com/v3/search/book',
      queryParameters: {
        'query': query,
        'size': 20,
        'page': 1,
      },
      options: Options(headers: {
        'Authorization': 'KakaoAK ${Secrets.kakaoRestApiKey}',
      }),
    );

    final documents = response.data['documents'] as List? ?? [];
    return documents.map((doc) {
      final isbnParts = (doc['isbn'] as String? ?? '').split(' ');
      return BookSearchResult(
        isbn13: isbnParts.length > 1 ? isbnParts[1] : (isbnParts.isNotEmpty ? isbnParts.first : ''),
        isbn10: isbnParts.isNotEmpty ? isbnParts.first : null,
        title: doc['title']?.toString() ?? '',
        author: (doc['authors'] as List?)?.join(', ') ?? '',
        publisher: doc['publisher']?.toString() ?? '',
        pubDate: _formatKakaoDate(doc['datetime']?.toString()),
        description: doc['contents']?.toString(),
        thumbnail: doc['thumbnail']?.toString(),
        cover: doc['thumbnail']?.toString(),
        source: BookSearchSource.kakao,
        link: doc['url']?.toString(),
        priceStandard: doc['price'] as int?,
        priceSales: (doc['sale_price'] as int?) != -1 ? doc['sale_price'] as int? : null,
      );
    }).where((r) => r.isbn13.isNotEmpty).toList();
  }

  /// Strip HTML tags from text
  String _stripHtml(String? text) {
    if (text == null) return '';
    return text.replaceAll(RegExp(r'<[^>]*>'), '');
  }

  /// Format Naver date (YYYYMMDD -> YYYY-MM-DD)
  String? _formatNaverDate(String? date) {
    if (date == null || date.length != 8) return date;
    return '${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}';
  }

  /// Format Kakao datetime (ISO 8601 -> YYYY-MM-DD)
  String? _formatKakaoDate(String? datetime) {
    if (datetime == null || datetime.length < 10) return null;
    return datetime.substring(0, 10);
  }
}
