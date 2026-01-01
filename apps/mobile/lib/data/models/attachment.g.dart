// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'attachment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_AttachmentRow _$AttachmentRowFromJson(Map<String, dynamic> json) =>
    _AttachmentRow(
      id: json['id'] as String,
      noteId: json['note_id'] as String,
      type: $enumDecode(_$AttachmentTypeEnumMap, json['type']),
      storagePath: json['storage_path'] as String,
      filename: json['filename'] as String?,
      mimeType: json['mime_type'] as String?,
      size: (json['size'] as num?)?.toInt(),
      metadata: json['metadata'] as Map<String, dynamic>?,
      originalUrl: json['original_url'] as String?,
      authorName: json['author_name'] as String?,
      authorUrl: json['author_url'] as String?,
      caption: json['caption'] as String?,
      createdAt: json['created_at'] as String,
    );

Map<String, dynamic> _$AttachmentRowToJson(_AttachmentRow instance) =>
    <String, dynamic>{
      'id': instance.id,
      'note_id': instance.noteId,
      'type': _$AttachmentTypeEnumMap[instance.type]!,
      'storage_path': instance.storagePath,
      'filename': instance.filename,
      'mime_type': instance.mimeType,
      'size': instance.size,
      'metadata': instance.metadata,
      'original_url': instance.originalUrl,
      'author_name': instance.authorName,
      'author_url': instance.authorUrl,
      'caption': instance.caption,
      'created_at': instance.createdAt,
    };

const _$AttachmentTypeEnumMap = {
  AttachmentType.image: 'image',
  AttachmentType.audio: 'audio',
  AttachmentType.video: 'video',
  AttachmentType.file: 'file',
  AttachmentType.text: 'text',
  AttachmentType.instagram: 'instagram',
  AttachmentType.youtube: 'youtube',
};
