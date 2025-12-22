import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:throw_mobile/data/models/attachment.dart';
import 'package:throw_mobile/data/models/tag.dart';

part 'note.freezed.dart';
part 'note.g.dart';

enum NoteSource {
  @JsonValue('mobile')
  mobile,
  @JsonValue('desktop')
  desktop,
  @JsonValue('web')
  web,
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
  }) = _NoteRow;

  factory NoteRow.fromJson(Map<String, dynamic> json) => _$NoteRowFromJson(json);
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
    );
  }

  /// Check if this note is a reply (has parent)
  bool get isReply => parentId != null;
}
