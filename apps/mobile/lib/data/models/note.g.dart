// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'note.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_NoteRow _$NoteRowFromJson(Map<String, dynamic> json) => _NoteRow(
  id: json['id'] as String,
  content: json['content'] as String?,
  parentId: json['parent_id'] as String?,
  createdAt: json['created_at'] as String,
  updatedAt: json['updated_at'] as String,
  source: $enumDecode(_$NoteSourceEnumMap, json['source']),
  isDeleted: json['is_deleted'] as bool? ?? false,
);

Map<String, dynamic> _$NoteRowToJson(_NoteRow instance) => <String, dynamic>{
  'id': instance.id,
  'content': instance.content,
  'parent_id': instance.parentId,
  'created_at': instance.createdAt,
  'updated_at': instance.updatedAt,
  'source': _$NoteSourceEnumMap[instance.source]!,
  'is_deleted': instance.isDeleted,
};

const _$NoteSourceEnumMap = {
  NoteSource.mobile: 'mobile',
  NoteSource.desktop: 'desktop',
  NoteSource.web: 'web',
};
