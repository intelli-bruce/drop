// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'book.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_BookRow _$BookRowFromJson(Map<String, dynamic> json) => _BookRow(
  id: json['id'] as String,
  isbn13: json['isbn13'] as String,
  title: json['title'] as String,
  author: json['author'] as String,
  publisher: json['publisher'] as String?,
  pubDate: json['pub_date'] as String?,
  description: json['description'] as String?,
  coverStoragePath: json['cover_storage_path'] as String?,
  coverUrl: json['cover_url'] as String?,
  readingStatus: $enumDecode(_$ReadingStatusEnumMap, json['reading_status']),
  startedAt: json['started_at'] as String?,
  finishedAt: json['finished_at'] as String?,
  rating: (json['rating'] as num?)?.toInt(),
  createdAt: json['created_at'] as String,
  updatedAt: json['updated_at'] as String,
);

Map<String, dynamic> _$BookRowToJson(_BookRow instance) => <String, dynamic>{
  'id': instance.id,
  'isbn13': instance.isbn13,
  'title': instance.title,
  'author': instance.author,
  'publisher': instance.publisher,
  'pub_date': instance.pubDate,
  'description': instance.description,
  'cover_storage_path': instance.coverStoragePath,
  'cover_url': instance.coverUrl,
  'reading_status': _$ReadingStatusEnumMap[instance.readingStatus]!,
  'started_at': instance.startedAt,
  'finished_at': instance.finishedAt,
  'rating': instance.rating,
  'created_at': instance.createdAt,
  'updated_at': instance.updatedAt,
};

const _$ReadingStatusEnumMap = {
  ReadingStatus.toRead: 'to_read',
  ReadingStatus.reading: 'reading',
  ReadingStatus.completed: 'completed',
};
