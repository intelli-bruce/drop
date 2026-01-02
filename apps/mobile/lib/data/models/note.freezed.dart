// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'note.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$NoteRow {

 String get id;@JsonKey(name: 'display_id') int get displayId; String? get content;@JsonKey(name: 'parent_id') String? get parentId;@JsonKey(name: 'created_at') String get createdAt;@JsonKey(name: 'updated_at') String get updatedAt; NoteSource get source;@JsonKey(name: 'is_deleted') bool get isDeleted;@JsonKey(name: 'deleted_at') String? get deletedAt;@JsonKey(name: 'archived_at') String? get archivedAt;@JsonKey(name: 'has_link') bool get hasLink;@JsonKey(name: 'has_media') bool get hasMedia;@JsonKey(name: 'has_files') bool get hasFiles;@JsonKey(name: 'is_locked') bool get isLocked;
/// Create a copy of NoteRow
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$NoteRowCopyWith<NoteRow> get copyWith => _$NoteRowCopyWithImpl<NoteRow>(this as NoteRow, _$identity);

  /// Serializes this NoteRow to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is NoteRow&&(identical(other.id, id) || other.id == id)&&(identical(other.displayId, displayId) || other.displayId == displayId)&&(identical(other.content, content) || other.content == content)&&(identical(other.parentId, parentId) || other.parentId == parentId)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.source, source) || other.source == source)&&(identical(other.isDeleted, isDeleted) || other.isDeleted == isDeleted)&&(identical(other.deletedAt, deletedAt) || other.deletedAt == deletedAt)&&(identical(other.archivedAt, archivedAt) || other.archivedAt == archivedAt)&&(identical(other.hasLink, hasLink) || other.hasLink == hasLink)&&(identical(other.hasMedia, hasMedia) || other.hasMedia == hasMedia)&&(identical(other.hasFiles, hasFiles) || other.hasFiles == hasFiles)&&(identical(other.isLocked, isLocked) || other.isLocked == isLocked));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,displayId,content,parentId,createdAt,updatedAt,source,isDeleted,deletedAt,archivedAt,hasLink,hasMedia,hasFiles,isLocked);

@override
String toString() {
  return 'NoteRow(id: $id, displayId: $displayId, content: $content, parentId: $parentId, createdAt: $createdAt, updatedAt: $updatedAt, source: $source, isDeleted: $isDeleted, deletedAt: $deletedAt, archivedAt: $archivedAt, hasLink: $hasLink, hasMedia: $hasMedia, hasFiles: $hasFiles, isLocked: $isLocked)';
}


}

/// @nodoc
abstract mixin class $NoteRowCopyWith<$Res>  {
  factory $NoteRowCopyWith(NoteRow value, $Res Function(NoteRow) _then) = _$NoteRowCopyWithImpl;
@useResult
$Res call({
 String id,@JsonKey(name: 'display_id') int displayId, String? content,@JsonKey(name: 'parent_id') String? parentId,@JsonKey(name: 'created_at') String createdAt,@JsonKey(name: 'updated_at') String updatedAt, NoteSource source,@JsonKey(name: 'is_deleted') bool isDeleted,@JsonKey(name: 'deleted_at') String? deletedAt,@JsonKey(name: 'archived_at') String? archivedAt,@JsonKey(name: 'has_link') bool hasLink,@JsonKey(name: 'has_media') bool hasMedia,@JsonKey(name: 'has_files') bool hasFiles,@JsonKey(name: 'is_locked') bool isLocked
});




}
/// @nodoc
class _$NoteRowCopyWithImpl<$Res>
    implements $NoteRowCopyWith<$Res> {
  _$NoteRowCopyWithImpl(this._self, this._then);

  final NoteRow _self;
  final $Res Function(NoteRow) _then;

/// Create a copy of NoteRow
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? displayId = null,Object? content = freezed,Object? parentId = freezed,Object? createdAt = null,Object? updatedAt = null,Object? source = null,Object? isDeleted = null,Object? deletedAt = freezed,Object? archivedAt = freezed,Object? hasLink = null,Object? hasMedia = null,Object? hasFiles = null,Object? isLocked = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,displayId: null == displayId ? _self.displayId : displayId // ignore: cast_nullable_to_non_nullable
as int,content: freezed == content ? _self.content : content // ignore: cast_nullable_to_non_nullable
as String?,parentId: freezed == parentId ? _self.parentId : parentId // ignore: cast_nullable_to_non_nullable
as String?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,updatedAt: null == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as String,source: null == source ? _self.source : source // ignore: cast_nullable_to_non_nullable
as NoteSource,isDeleted: null == isDeleted ? _self.isDeleted : isDeleted // ignore: cast_nullable_to_non_nullable
as bool,deletedAt: freezed == deletedAt ? _self.deletedAt : deletedAt // ignore: cast_nullable_to_non_nullable
as String?,archivedAt: freezed == archivedAt ? _self.archivedAt : archivedAt // ignore: cast_nullable_to_non_nullable
as String?,hasLink: null == hasLink ? _self.hasLink : hasLink // ignore: cast_nullable_to_non_nullable
as bool,hasMedia: null == hasMedia ? _self.hasMedia : hasMedia // ignore: cast_nullable_to_non_nullable
as bool,hasFiles: null == hasFiles ? _self.hasFiles : hasFiles // ignore: cast_nullable_to_non_nullable
as bool,isLocked: null == isLocked ? _self.isLocked : isLocked // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [NoteRow].
extension NoteRowPatterns on NoteRow {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _NoteRow value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _NoteRow() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _NoteRow value)  $default,){
final _that = this;
switch (_that) {
case _NoteRow():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _NoteRow value)?  $default,){
final _that = this;
switch (_that) {
case _NoteRow() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id, @JsonKey(name: 'display_id')  int displayId,  String? content, @JsonKey(name: 'parent_id')  String? parentId, @JsonKey(name: 'created_at')  String createdAt, @JsonKey(name: 'updated_at')  String updatedAt,  NoteSource source, @JsonKey(name: 'is_deleted')  bool isDeleted, @JsonKey(name: 'deleted_at')  String? deletedAt, @JsonKey(name: 'archived_at')  String? archivedAt, @JsonKey(name: 'has_link')  bool hasLink, @JsonKey(name: 'has_media')  bool hasMedia, @JsonKey(name: 'has_files')  bool hasFiles, @JsonKey(name: 'is_locked')  bool isLocked)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _NoteRow() when $default != null:
return $default(_that.id,_that.displayId,_that.content,_that.parentId,_that.createdAt,_that.updatedAt,_that.source,_that.isDeleted,_that.deletedAt,_that.archivedAt,_that.hasLink,_that.hasMedia,_that.hasFiles,_that.isLocked);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id, @JsonKey(name: 'display_id')  int displayId,  String? content, @JsonKey(name: 'parent_id')  String? parentId, @JsonKey(name: 'created_at')  String createdAt, @JsonKey(name: 'updated_at')  String updatedAt,  NoteSource source, @JsonKey(name: 'is_deleted')  bool isDeleted, @JsonKey(name: 'deleted_at')  String? deletedAt, @JsonKey(name: 'archived_at')  String? archivedAt, @JsonKey(name: 'has_link')  bool hasLink, @JsonKey(name: 'has_media')  bool hasMedia, @JsonKey(name: 'has_files')  bool hasFiles, @JsonKey(name: 'is_locked')  bool isLocked)  $default,) {final _that = this;
switch (_that) {
case _NoteRow():
return $default(_that.id,_that.displayId,_that.content,_that.parentId,_that.createdAt,_that.updatedAt,_that.source,_that.isDeleted,_that.deletedAt,_that.archivedAt,_that.hasLink,_that.hasMedia,_that.hasFiles,_that.isLocked);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id, @JsonKey(name: 'display_id')  int displayId,  String? content, @JsonKey(name: 'parent_id')  String? parentId, @JsonKey(name: 'created_at')  String createdAt, @JsonKey(name: 'updated_at')  String updatedAt,  NoteSource source, @JsonKey(name: 'is_deleted')  bool isDeleted, @JsonKey(name: 'deleted_at')  String? deletedAt, @JsonKey(name: 'archived_at')  String? archivedAt, @JsonKey(name: 'has_link')  bool hasLink, @JsonKey(name: 'has_media')  bool hasMedia, @JsonKey(name: 'has_files')  bool hasFiles, @JsonKey(name: 'is_locked')  bool isLocked)?  $default,) {final _that = this;
switch (_that) {
case _NoteRow() when $default != null:
return $default(_that.id,_that.displayId,_that.content,_that.parentId,_that.createdAt,_that.updatedAt,_that.source,_that.isDeleted,_that.deletedAt,_that.archivedAt,_that.hasLink,_that.hasMedia,_that.hasFiles,_that.isLocked);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _NoteRow implements NoteRow {
  const _NoteRow({required this.id, @JsonKey(name: 'display_id') required this.displayId, this.content, @JsonKey(name: 'parent_id') this.parentId, @JsonKey(name: 'created_at') required this.createdAt, @JsonKey(name: 'updated_at') required this.updatedAt, required this.source, @JsonKey(name: 'is_deleted') this.isDeleted = false, @JsonKey(name: 'deleted_at') this.deletedAt, @JsonKey(name: 'archived_at') this.archivedAt, @JsonKey(name: 'has_link') this.hasLink = false, @JsonKey(name: 'has_media') this.hasMedia = false, @JsonKey(name: 'has_files') this.hasFiles = false, @JsonKey(name: 'is_locked') this.isLocked = false});
  factory _NoteRow.fromJson(Map<String, dynamic> json) => _$NoteRowFromJson(json);

@override final  String id;
@override@JsonKey(name: 'display_id') final  int displayId;
@override final  String? content;
@override@JsonKey(name: 'parent_id') final  String? parentId;
@override@JsonKey(name: 'created_at') final  String createdAt;
@override@JsonKey(name: 'updated_at') final  String updatedAt;
@override final  NoteSource source;
@override@JsonKey(name: 'is_deleted') final  bool isDeleted;
@override@JsonKey(name: 'deleted_at') final  String? deletedAt;
@override@JsonKey(name: 'archived_at') final  String? archivedAt;
@override@JsonKey(name: 'has_link') final  bool hasLink;
@override@JsonKey(name: 'has_media') final  bool hasMedia;
@override@JsonKey(name: 'has_files') final  bool hasFiles;
@override@JsonKey(name: 'is_locked') final  bool isLocked;

/// Create a copy of NoteRow
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$NoteRowCopyWith<_NoteRow> get copyWith => __$NoteRowCopyWithImpl<_NoteRow>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$NoteRowToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _NoteRow&&(identical(other.id, id) || other.id == id)&&(identical(other.displayId, displayId) || other.displayId == displayId)&&(identical(other.content, content) || other.content == content)&&(identical(other.parentId, parentId) || other.parentId == parentId)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.source, source) || other.source == source)&&(identical(other.isDeleted, isDeleted) || other.isDeleted == isDeleted)&&(identical(other.deletedAt, deletedAt) || other.deletedAt == deletedAt)&&(identical(other.archivedAt, archivedAt) || other.archivedAt == archivedAt)&&(identical(other.hasLink, hasLink) || other.hasLink == hasLink)&&(identical(other.hasMedia, hasMedia) || other.hasMedia == hasMedia)&&(identical(other.hasFiles, hasFiles) || other.hasFiles == hasFiles)&&(identical(other.isLocked, isLocked) || other.isLocked == isLocked));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,displayId,content,parentId,createdAt,updatedAt,source,isDeleted,deletedAt,archivedAt,hasLink,hasMedia,hasFiles,isLocked);

@override
String toString() {
  return 'NoteRow(id: $id, displayId: $displayId, content: $content, parentId: $parentId, createdAt: $createdAt, updatedAt: $updatedAt, source: $source, isDeleted: $isDeleted, deletedAt: $deletedAt, archivedAt: $archivedAt, hasLink: $hasLink, hasMedia: $hasMedia, hasFiles: $hasFiles, isLocked: $isLocked)';
}


}

/// @nodoc
abstract mixin class _$NoteRowCopyWith<$Res> implements $NoteRowCopyWith<$Res> {
  factory _$NoteRowCopyWith(_NoteRow value, $Res Function(_NoteRow) _then) = __$NoteRowCopyWithImpl;
@override @useResult
$Res call({
 String id,@JsonKey(name: 'display_id') int displayId, String? content,@JsonKey(name: 'parent_id') String? parentId,@JsonKey(name: 'created_at') String createdAt,@JsonKey(name: 'updated_at') String updatedAt, NoteSource source,@JsonKey(name: 'is_deleted') bool isDeleted,@JsonKey(name: 'deleted_at') String? deletedAt,@JsonKey(name: 'archived_at') String? archivedAt,@JsonKey(name: 'has_link') bool hasLink,@JsonKey(name: 'has_media') bool hasMedia,@JsonKey(name: 'has_files') bool hasFiles,@JsonKey(name: 'is_locked') bool isLocked
});




}
/// @nodoc
class __$NoteRowCopyWithImpl<$Res>
    implements _$NoteRowCopyWith<$Res> {
  __$NoteRowCopyWithImpl(this._self, this._then);

  final _NoteRow _self;
  final $Res Function(_NoteRow) _then;

/// Create a copy of NoteRow
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? displayId = null,Object? content = freezed,Object? parentId = freezed,Object? createdAt = null,Object? updatedAt = null,Object? source = null,Object? isDeleted = null,Object? deletedAt = freezed,Object? archivedAt = freezed,Object? hasLink = null,Object? hasMedia = null,Object? hasFiles = null,Object? isLocked = null,}) {
  return _then(_NoteRow(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,displayId: null == displayId ? _self.displayId : displayId // ignore: cast_nullable_to_non_nullable
as int,content: freezed == content ? _self.content : content // ignore: cast_nullable_to_non_nullable
as String?,parentId: freezed == parentId ? _self.parentId : parentId // ignore: cast_nullable_to_non_nullable
as String?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,updatedAt: null == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as String,source: null == source ? _self.source : source // ignore: cast_nullable_to_non_nullable
as NoteSource,isDeleted: null == isDeleted ? _self.isDeleted : isDeleted // ignore: cast_nullable_to_non_nullable
as bool,deletedAt: freezed == deletedAt ? _self.deletedAt : deletedAt // ignore: cast_nullable_to_non_nullable
as String?,archivedAt: freezed == archivedAt ? _self.archivedAt : archivedAt // ignore: cast_nullable_to_non_nullable
as String?,hasLink: null == hasLink ? _self.hasLink : hasLink // ignore: cast_nullable_to_non_nullable
as bool,hasMedia: null == hasMedia ? _self.hasMedia : hasMedia // ignore: cast_nullable_to_non_nullable
as bool,hasFiles: null == hasFiles ? _self.hasFiles : hasFiles // ignore: cast_nullable_to_non_nullable
as bool,isLocked: null == isLocked ? _self.isLocked : isLocked // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

/// @nodoc
mixin _$Note {

 String get id; int get displayId; String get content; String? get parentId; List<Attachment> get attachments; List<Tag> get tags; DateTime get createdAt; DateTime get updatedAt; NoteSource get source; bool get isDeleted; DateTime? get deletedAt; DateTime? get archivedAt; bool get hasLink; bool get hasMedia; bool get hasFiles; bool get isLocked;
/// Create a copy of Note
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$NoteCopyWith<Note> get copyWith => _$NoteCopyWithImpl<Note>(this as Note, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Note&&(identical(other.id, id) || other.id == id)&&(identical(other.displayId, displayId) || other.displayId == displayId)&&(identical(other.content, content) || other.content == content)&&(identical(other.parentId, parentId) || other.parentId == parentId)&&const DeepCollectionEquality().equals(other.attachments, attachments)&&const DeepCollectionEquality().equals(other.tags, tags)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.source, source) || other.source == source)&&(identical(other.isDeleted, isDeleted) || other.isDeleted == isDeleted)&&(identical(other.deletedAt, deletedAt) || other.deletedAt == deletedAt)&&(identical(other.archivedAt, archivedAt) || other.archivedAt == archivedAt)&&(identical(other.hasLink, hasLink) || other.hasLink == hasLink)&&(identical(other.hasMedia, hasMedia) || other.hasMedia == hasMedia)&&(identical(other.hasFiles, hasFiles) || other.hasFiles == hasFiles)&&(identical(other.isLocked, isLocked) || other.isLocked == isLocked));
}


@override
int get hashCode => Object.hash(runtimeType,id,displayId,content,parentId,const DeepCollectionEquality().hash(attachments),const DeepCollectionEquality().hash(tags),createdAt,updatedAt,source,isDeleted,deletedAt,archivedAt,hasLink,hasMedia,hasFiles,isLocked);

@override
String toString() {
  return 'Note(id: $id, displayId: $displayId, content: $content, parentId: $parentId, attachments: $attachments, tags: $tags, createdAt: $createdAt, updatedAt: $updatedAt, source: $source, isDeleted: $isDeleted, deletedAt: $deletedAt, archivedAt: $archivedAt, hasLink: $hasLink, hasMedia: $hasMedia, hasFiles: $hasFiles, isLocked: $isLocked)';
}


}

/// @nodoc
abstract mixin class $NoteCopyWith<$Res>  {
  factory $NoteCopyWith(Note value, $Res Function(Note) _then) = _$NoteCopyWithImpl;
@useResult
$Res call({
 String id, int displayId, String content, String? parentId, List<Attachment> attachments, List<Tag> tags, DateTime createdAt, DateTime updatedAt, NoteSource source, bool isDeleted, DateTime? deletedAt, DateTime? archivedAt, bool hasLink, bool hasMedia, bool hasFiles, bool isLocked
});




}
/// @nodoc
class _$NoteCopyWithImpl<$Res>
    implements $NoteCopyWith<$Res> {
  _$NoteCopyWithImpl(this._self, this._then);

  final Note _self;
  final $Res Function(Note) _then;

/// Create a copy of Note
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? displayId = null,Object? content = null,Object? parentId = freezed,Object? attachments = null,Object? tags = null,Object? createdAt = null,Object? updatedAt = null,Object? source = null,Object? isDeleted = null,Object? deletedAt = freezed,Object? archivedAt = freezed,Object? hasLink = null,Object? hasMedia = null,Object? hasFiles = null,Object? isLocked = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,displayId: null == displayId ? _self.displayId : displayId // ignore: cast_nullable_to_non_nullable
as int,content: null == content ? _self.content : content // ignore: cast_nullable_to_non_nullable
as String,parentId: freezed == parentId ? _self.parentId : parentId // ignore: cast_nullable_to_non_nullable
as String?,attachments: null == attachments ? _self.attachments : attachments // ignore: cast_nullable_to_non_nullable
as List<Attachment>,tags: null == tags ? _self.tags : tags // ignore: cast_nullable_to_non_nullable
as List<Tag>,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,updatedAt: null == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime,source: null == source ? _self.source : source // ignore: cast_nullable_to_non_nullable
as NoteSource,isDeleted: null == isDeleted ? _self.isDeleted : isDeleted // ignore: cast_nullable_to_non_nullable
as bool,deletedAt: freezed == deletedAt ? _self.deletedAt : deletedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,archivedAt: freezed == archivedAt ? _self.archivedAt : archivedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,hasLink: null == hasLink ? _self.hasLink : hasLink // ignore: cast_nullable_to_non_nullable
as bool,hasMedia: null == hasMedia ? _self.hasMedia : hasMedia // ignore: cast_nullable_to_non_nullable
as bool,hasFiles: null == hasFiles ? _self.hasFiles : hasFiles // ignore: cast_nullable_to_non_nullable
as bool,isLocked: null == isLocked ? _self.isLocked : isLocked // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [Note].
extension NotePatterns on Note {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Note value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Note() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Note value)  $default,){
final _that = this;
switch (_that) {
case _Note():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Note value)?  $default,){
final _that = this;
switch (_that) {
case _Note() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  int displayId,  String content,  String? parentId,  List<Attachment> attachments,  List<Tag> tags,  DateTime createdAt,  DateTime updatedAt,  NoteSource source,  bool isDeleted,  DateTime? deletedAt,  DateTime? archivedAt,  bool hasLink,  bool hasMedia,  bool hasFiles,  bool isLocked)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Note() when $default != null:
return $default(_that.id,_that.displayId,_that.content,_that.parentId,_that.attachments,_that.tags,_that.createdAt,_that.updatedAt,_that.source,_that.isDeleted,_that.deletedAt,_that.archivedAt,_that.hasLink,_that.hasMedia,_that.hasFiles,_that.isLocked);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  int displayId,  String content,  String? parentId,  List<Attachment> attachments,  List<Tag> tags,  DateTime createdAt,  DateTime updatedAt,  NoteSource source,  bool isDeleted,  DateTime? deletedAt,  DateTime? archivedAt,  bool hasLink,  bool hasMedia,  bool hasFiles,  bool isLocked)  $default,) {final _that = this;
switch (_that) {
case _Note():
return $default(_that.id,_that.displayId,_that.content,_that.parentId,_that.attachments,_that.tags,_that.createdAt,_that.updatedAt,_that.source,_that.isDeleted,_that.deletedAt,_that.archivedAt,_that.hasLink,_that.hasMedia,_that.hasFiles,_that.isLocked);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  int displayId,  String content,  String? parentId,  List<Attachment> attachments,  List<Tag> tags,  DateTime createdAt,  DateTime updatedAt,  NoteSource source,  bool isDeleted,  DateTime? deletedAt,  DateTime? archivedAt,  bool hasLink,  bool hasMedia,  bool hasFiles,  bool isLocked)?  $default,) {final _that = this;
switch (_that) {
case _Note() when $default != null:
return $default(_that.id,_that.displayId,_that.content,_that.parentId,_that.attachments,_that.tags,_that.createdAt,_that.updatedAt,_that.source,_that.isDeleted,_that.deletedAt,_that.archivedAt,_that.hasLink,_that.hasMedia,_that.hasFiles,_that.isLocked);case _:
  return null;

}
}

}

/// @nodoc


class _Note extends Note {
  const _Note({required this.id, required this.displayId, required this.content, this.parentId, final  List<Attachment> attachments = const [], final  List<Tag> tags = const [], required this.createdAt, required this.updatedAt, required this.source, this.isDeleted = false, this.deletedAt, this.archivedAt, this.hasLink = false, this.hasMedia = false, this.hasFiles = false, this.isLocked = false}): _attachments = attachments,_tags = tags,super._();
  

@override final  String id;
@override final  int displayId;
@override final  String content;
@override final  String? parentId;
 final  List<Attachment> _attachments;
@override@JsonKey() List<Attachment> get attachments {
  if (_attachments is EqualUnmodifiableListView) return _attachments;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_attachments);
}

 final  List<Tag> _tags;
@override@JsonKey() List<Tag> get tags {
  if (_tags is EqualUnmodifiableListView) return _tags;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_tags);
}

@override final  DateTime createdAt;
@override final  DateTime updatedAt;
@override final  NoteSource source;
@override@JsonKey() final  bool isDeleted;
@override final  DateTime? deletedAt;
@override final  DateTime? archivedAt;
@override@JsonKey() final  bool hasLink;
@override@JsonKey() final  bool hasMedia;
@override@JsonKey() final  bool hasFiles;
@override@JsonKey() final  bool isLocked;

/// Create a copy of Note
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$NoteCopyWith<_Note> get copyWith => __$NoteCopyWithImpl<_Note>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Note&&(identical(other.id, id) || other.id == id)&&(identical(other.displayId, displayId) || other.displayId == displayId)&&(identical(other.content, content) || other.content == content)&&(identical(other.parentId, parentId) || other.parentId == parentId)&&const DeepCollectionEquality().equals(other._attachments, _attachments)&&const DeepCollectionEquality().equals(other._tags, _tags)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.source, source) || other.source == source)&&(identical(other.isDeleted, isDeleted) || other.isDeleted == isDeleted)&&(identical(other.deletedAt, deletedAt) || other.deletedAt == deletedAt)&&(identical(other.archivedAt, archivedAt) || other.archivedAt == archivedAt)&&(identical(other.hasLink, hasLink) || other.hasLink == hasLink)&&(identical(other.hasMedia, hasMedia) || other.hasMedia == hasMedia)&&(identical(other.hasFiles, hasFiles) || other.hasFiles == hasFiles)&&(identical(other.isLocked, isLocked) || other.isLocked == isLocked));
}


@override
int get hashCode => Object.hash(runtimeType,id,displayId,content,parentId,const DeepCollectionEquality().hash(_attachments),const DeepCollectionEquality().hash(_tags),createdAt,updatedAt,source,isDeleted,deletedAt,archivedAt,hasLink,hasMedia,hasFiles,isLocked);

@override
String toString() {
  return 'Note(id: $id, displayId: $displayId, content: $content, parentId: $parentId, attachments: $attachments, tags: $tags, createdAt: $createdAt, updatedAt: $updatedAt, source: $source, isDeleted: $isDeleted, deletedAt: $deletedAt, archivedAt: $archivedAt, hasLink: $hasLink, hasMedia: $hasMedia, hasFiles: $hasFiles, isLocked: $isLocked)';
}


}

/// @nodoc
abstract mixin class _$NoteCopyWith<$Res> implements $NoteCopyWith<$Res> {
  factory _$NoteCopyWith(_Note value, $Res Function(_Note) _then) = __$NoteCopyWithImpl;
@override @useResult
$Res call({
 String id, int displayId, String content, String? parentId, List<Attachment> attachments, List<Tag> tags, DateTime createdAt, DateTime updatedAt, NoteSource source, bool isDeleted, DateTime? deletedAt, DateTime? archivedAt, bool hasLink, bool hasMedia, bool hasFiles, bool isLocked
});




}
/// @nodoc
class __$NoteCopyWithImpl<$Res>
    implements _$NoteCopyWith<$Res> {
  __$NoteCopyWithImpl(this._self, this._then);

  final _Note _self;
  final $Res Function(_Note) _then;

/// Create a copy of Note
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? displayId = null,Object? content = null,Object? parentId = freezed,Object? attachments = null,Object? tags = null,Object? createdAt = null,Object? updatedAt = null,Object? source = null,Object? isDeleted = null,Object? deletedAt = freezed,Object? archivedAt = freezed,Object? hasLink = null,Object? hasMedia = null,Object? hasFiles = null,Object? isLocked = null,}) {
  return _then(_Note(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,displayId: null == displayId ? _self.displayId : displayId // ignore: cast_nullable_to_non_nullable
as int,content: null == content ? _self.content : content // ignore: cast_nullable_to_non_nullable
as String,parentId: freezed == parentId ? _self.parentId : parentId // ignore: cast_nullable_to_non_nullable
as String?,attachments: null == attachments ? _self._attachments : attachments // ignore: cast_nullable_to_non_nullable
as List<Attachment>,tags: null == tags ? _self._tags : tags // ignore: cast_nullable_to_non_nullable
as List<Tag>,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,updatedAt: null == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime,source: null == source ? _self.source : source // ignore: cast_nullable_to_non_nullable
as NoteSource,isDeleted: null == isDeleted ? _self.isDeleted : isDeleted // ignore: cast_nullable_to_non_nullable
as bool,deletedAt: freezed == deletedAt ? _self.deletedAt : deletedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,archivedAt: freezed == archivedAt ? _self.archivedAt : archivedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,hasLink: null == hasLink ? _self.hasLink : hasLink // ignore: cast_nullable_to_non_nullable
as bool,hasMedia: null == hasMedia ? _self.hasMedia : hasMedia // ignore: cast_nullable_to_non_nullable
as bool,hasFiles: null == hasFiles ? _self.hasFiles : hasFiles // ignore: cast_nullable_to_non_nullable
as bool,isLocked: null == isLocked ? _self.isLocked : isLocked // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
