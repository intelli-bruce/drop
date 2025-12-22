import 'package:freezed_annotation/freezed_annotation.dart';

part 'attachment.freezed.dart';
part 'attachment.g.dart';

enum AttachmentType {
  @JsonValue('image')
  image,
  @JsonValue('audio')
  audio,
  @JsonValue('video')
  video,
  @JsonValue('file')
  file,
  @JsonValue('text')
  text,
  @JsonValue('instagram')
  instagram,
}

/// Database row type (snake_case)
@freezed
abstract class AttachmentRow with _$AttachmentRow {
  const factory AttachmentRow({
    required String id,
    @JsonKey(name: 'note_id') required String noteId,
    required AttachmentType type,
    @JsonKey(name: 'storage_path') required String storagePath,
    String? filename,
    @JsonKey(name: 'mime_type') String? mimeType,
    int? size,
    Map<String, dynamic>? metadata,
    @JsonKey(name: 'original_url') String? originalUrl,
    @JsonKey(name: 'author_name') String? authorName,
    @JsonKey(name: 'author_url') String? authorUrl,
    String? caption,
    @JsonKey(name: 'created_at') required String createdAt,
  }) = _AttachmentRow;

  factory AttachmentRow.fromJson(Map<String, dynamic> json) =>
      _$AttachmentRowFromJson(json);
}

/// Application type (camelCase)
@freezed
abstract class Attachment with _$Attachment {
  const Attachment._();

  const factory Attachment({
    required String id,
    required String noteId,
    required AttachmentType type,
    required String storagePath,
    String? filename,
    String? mimeType,
    int? size,
    Map<String, dynamic>? metadata,
    String? originalUrl,
    String? authorName,
    String? authorUrl,
    String? caption,
    required DateTime createdAt,
  }) = _Attachment;

  /// Convert from database row
  factory Attachment.fromRow(AttachmentRow row) {
    return Attachment(
      id: row.id,
      noteId: row.noteId,
      type: row.type,
      storagePath: row.storagePath,
      filename: row.filename,
      mimeType: row.mimeType,
      size: row.size,
      metadata: row.metadata,
      originalUrl: row.originalUrl,
      authorName: row.authorName,
      authorUrl: row.authorUrl,
      caption: row.caption,
      createdAt: DateTime.parse(row.createdAt),
    );
  }

  /// Check if this is an image attachment
  bool get isImage => type == AttachmentType.image;

  /// Check if this is a video attachment
  bool get isVideo => type == AttachmentType.video;

  /// Check if this is an Instagram embed
  bool get isInstagram => type == AttachmentType.instagram;

  /// Get formatted file size
  String get formattedSize {
    if (size == null) return '';
    if (size! < 1024) return '$size B';
    if (size! < 1024 * 1024) return '${(size! / 1024).toStringAsFixed(1)} KB';
    return '${(size! / (1024 * 1024)).toStringAsFixed(1)} MB';
  }
}
