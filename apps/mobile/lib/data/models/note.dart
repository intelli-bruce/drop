import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:drop_mobile/data/models/attachment.dart';
import 'package:drop_mobile/data/models/tag.dart';

part 'note.freezed.dart';
part 'note.g.dart';

enum NoteSource {
  @JsonValue('mobile')
  mobile,
  @JsonValue('desktop')
  desktop,
  @JsonValue('web')
  web,
  @JsonValue('mcp')
  mcp,
}

/// Database row type (snake_case)
@freezed
abstract class NoteRow with _$NoteRow {
  const factory NoteRow({
    required String id,
    String? content,
    @JsonKey(name: 'parent_id') String? parentId,
    @JsonKey(name: 'created_at') required String createdAt,
    @JsonKey(name: 'updated_at') required String updatedAt,
    required NoteSource source,
    @JsonKey(name: 'is_deleted') @Default(false) bool isDeleted,
    @JsonKey(name: 'deleted_at') String? deletedAt,
    @JsonKey(name: 'archived_at') String? archivedAt,
    @JsonKey(name: 'has_link') @Default(false) bool hasLink,
    @JsonKey(name: 'has_media') @Default(false) bool hasMedia,
    @JsonKey(name: 'has_files') @Default(false) bool hasFiles,
    @JsonKey(name: 'is_locked') @Default(false) bool isLocked,
  }) = _NoteRow;

  factory NoteRow.fromJson(Map<String, dynamic> json) => _$NoteRowFromJson(json);
}

/// View mode for filtering notes
enum NoteViewMode {
  active,
  archived,
  trash,
}

/// Category filter for notes
enum NoteCategory {
  all,
  links,
  media,
  files,
}

/// Application type (camelCase)
@freezed
abstract class Note with _$Note {
  const Note._();

  const factory Note({
    required String id,
    required String content,
    String? parentId,
    @Default([]) List<Attachment> attachments,
    @Default([]) List<Tag> tags,
    required DateTime createdAt,
    required DateTime updatedAt,
    required NoteSource source,
    @Default(false) bool isDeleted,
    DateTime? deletedAt,
    DateTime? archivedAt,
    @Default(false) bool hasLink,
    @Default(false) bool hasMedia,
    @Default(false) bool hasFiles,
    @Default(false) bool isLocked,
  }) = _Note;

  /// Convert from database row
  factory Note.fromRow(
    NoteRow row, {
    List<Attachment> attachments = const [],
    List<Tag> tags = const [],
  }) {
    return Note(
      id: row.id,
      content: row.content ?? '',
      parentId: row.parentId,
      attachments: attachments,
      tags: tags,
      createdAt: DateTime.parse(row.createdAt),
      updatedAt: DateTime.parse(row.updatedAt),
      source: row.source,
      isDeleted: row.isDeleted,
      deletedAt: row.deletedAt != null ? DateTime.parse(row.deletedAt!) : null,
      archivedAt: row.archivedAt != null ? DateTime.parse(row.archivedAt!) : null,
      hasLink: row.hasLink,
      hasMedia: row.hasMedia,
      hasFiles: row.hasFiles,
      isLocked: row.isLocked,
    );
  }

  /// Check if this note is a reply (has parent)
  bool get isReply => parentId != null;

  /// Check if this note is archived
  bool get isArchived => archivedAt != null;

  /// Check if this note is in trash (soft deleted with timestamp)
  bool get isInTrash => deletedAt != null;

  /// Check if this note is active (not archived and not in trash)
  bool get isActive => !isArchived && !isInTrash;

  /// Check if this note matches the given view mode
  bool matchesViewMode(NoteViewMode mode) {
    switch (mode) {
      case NoteViewMode.active:
        return isActive;
      case NoteViewMode.archived:
        return isArchived;
      case NoteViewMode.trash:
        return isInTrash;
    }
  }

  /// Check if this note matches the given category
  bool matchesCategory(NoteCategory category) {
    switch (category) {
      case NoteCategory.all:
        return true;
      case NoteCategory.links:
        return hasLink;
      case NoteCategory.media:
        return hasMedia;
      case NoteCategory.files:
        return hasFiles;
    }
  }
}
