// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'book_search_result.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_BookSearchResult _$BookSearchResultFromJson(Map<String, dynamic> json) =>
    _BookSearchResult(
      isbn13: json['isbn13'] as String,
      isbn10: json['isbn10'] as String?,
      title: json['title'] as String,
      author: json['author'] as String,
      publisher: json['publisher'] as String,
      pubDate: json['pubDate'] as String?,
      description: json['description'] as String?,
      thumbnail: json['thumbnail'] as String?,
      cover: json['cover'] as String?,
      source: $enumDecode(_$BookSearchSourceEnumMap, json['source']),
      sourceId: json['sourceId'] as String?,
      link: json['link'] as String?,
      priceStandard: (json['priceStandard'] as num?)?.toInt(),
      priceSales: (json['priceSales'] as num?)?.toInt(),
      category: json['category'] as String?,
    );

Map<String, dynamic> _$BookSearchResultToJson(_BookSearchResult instance) =>
    <String, dynamic>{
      'isbn13': instance.isbn13,
      'isbn10': instance.isbn10,
      'title': instance.title,
      'author': instance.author,
      'publisher': instance.publisher,
      'pubDate': instance.pubDate,
      'description': instance.description,
      'thumbnail': instance.thumbnail,
      'cover': instance.cover,
      'source': _$BookSearchSourceEnumMap[instance.source]!,
      'sourceId': instance.sourceId,
      'link': instance.link,
      'priceStandard': instance.priceStandard,
      'priceSales': instance.priceSales,
      'category': instance.category,
    };

const _$BookSearchSourceEnumMap = {
  BookSearchSource.aladin: 'aladin',
  BookSearchSource.naver: 'naver',
  BookSearchSource.kakao: 'kakao',
  BookSearchSource.google: 'google',
};
