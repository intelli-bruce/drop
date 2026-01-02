// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'note.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_NoteRow _$NoteRowFromJson(Map<String, dynamic> json) => _NoteRow(
  id: json['id'] as String,
  displayId: (json['display_id'] as num).toInt(),
  content: json['content'] as String?,
  parentId: json['parent_id'] as String?,
  createdAt: json['created_at'] as String,
  updatedAt: json['updated_at'] as String,
  source: $enumDecode(_$NoteSourceEnumMap, json['source']),
  isDeleted: json['is_deleted'] as bool? ?? false,
  deletedAt: json['deleted_at'] as String?,
  archivedAt: json['archived_at'] as String?,
  hasLink: json['has_link'] as bool? ?? false,
  hasMedia: json['has_media'] as bool? ?? false,
  hasFiles: json['has_files'] as bool? ?? false,
  isLocked: json['is_locked'] as bool? ?? false,
);

Map<String, dynamic> _$NoteRowToJson(_NoteRow instance) => <String, dynamic>{
  'id': instance.id,
  'display_id': instance.displayId,
  'content': instance.content,
  'parent_id': instance.parentId,
  'created_at': instance.createdAt,
  'updated_at': instance.updatedAt,
  'source': _$NoteSourceEnumMap[instance.source]!,
  'is_deleted': instance.isDeleted,
  'deleted_at': instance.deletedAt,
  'archived_at': instance.archivedAt,
  'has_link': instance.hasLink,
  'has_media': instance.hasMedia,
  'has_files': instance.hasFiles,
  'is_locked': instance.isLocked,
};

const _$NoteSourceEnumMap = {
  NoteSource.mobile: 'mobile',
  NoteSource.desktop: 'desktop',
  NoteSource.web: 'web',
  NoteSource.mcp: 'mcp',
};
