import 'package:freezed_annotation/freezed_annotation.dart';

part 'tag.freezed.dart';
part 'tag.g.dart';

/// Database row type (snake_case)
@freezed
abstract class TagRow with _$TagRow {
  const factory TagRow({
    required String id,
    required String name,
    @JsonKey(name: 'created_at') required String createdAt,
  }) = _TagRow;

  factory TagRow.fromJson(Map<String, dynamic> json) => _$TagRowFromJson(json);
}

/// Application type (camelCase)
@freezed
abstract class Tag with _$Tag {
  const Tag._();

  const factory Tag({
    required String id,
    required String name,
    required DateTime createdAt,
  }) = _Tag;

  /// Convert from database row
  factory Tag.fromRow(TagRow row) {
    return Tag(
      id: row.id,
      name: row.name,
      createdAt: DateTime.parse(row.createdAt),
    );
  }
}
