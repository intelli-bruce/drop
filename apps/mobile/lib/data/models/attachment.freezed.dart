// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'attachment.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$AttachmentRow {

 String get id;@JsonKey(name: 'note_id') String get noteId; AttachmentType get type;@JsonKey(name: 'storage_path') String get storagePath; String? get filename;@JsonKey(name: 'mime_type') String? get mimeType; int? get size; Map<String, dynamic>? get metadata;@JsonKey(name: 'original_url') String? get originalUrl;@JsonKey(name: 'author_name') String? get authorName;@JsonKey(name: 'author_url') String? get authorUrl; String? get caption;@JsonKey(name: 'created_at') String get createdAt;
/// Create a copy of AttachmentRow
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AttachmentRowCopyWith<AttachmentRow> get copyWith => _$AttachmentRowCopyWithImpl<AttachmentRow>(this as AttachmentRow, _$identity);

  /// Serializes this AttachmentRow to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AttachmentRow&&(identical(other.id, id) || other.id == id)&&(identical(other.noteId, noteId) || other.noteId == noteId)&&(identical(other.type, type) || other.type == type)&&(identical(other.storagePath, storagePath) || other.storagePath == storagePath)&&(identical(other.filename, filename) || other.filename == filename)&&(identical(other.mimeType, mimeType) || other.mimeType == mimeType)&&(identical(other.size, size) || other.size == size)&&const DeepCollectionEquality().equals(other.metadata, metadata)&&(identical(other.originalUrl, originalUrl) || other.originalUrl == originalUrl)&&(identical(other.authorName, authorName) || other.authorName == authorName)&&(identical(other.authorUrl, authorUrl) || other.authorUrl == authorUrl)&&(identical(other.caption, caption) || other.caption == caption)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,noteId,type,storagePath,filename,mimeType,size,const DeepCollectionEquality().hash(metadata),originalUrl,authorName,authorUrl,caption,createdAt);

@override
String toString() {
  return 'AttachmentRow(id: $id, noteId: $noteId, type: $type, storagePath: $storagePath, filename: $filename, mimeType: $mimeType, size: $size, metadata: $metadata, originalUrl: $originalUrl, authorName: $authorName, authorUrl: $authorUrl, caption: $caption, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $AttachmentRowCopyWith<$Res>  {
  factory $AttachmentRowCopyWith(AttachmentRow value, $Res Function(AttachmentRow) _then) = _$AttachmentRowCopyWithImpl;
@useResult
$Res call({
 String id,@JsonKey(name: 'note_id') String noteId, AttachmentType type,@JsonKey(name: 'storage_path') String storagePath, String? filename,@JsonKey(name: 'mime_type') String? mimeType, int? size, Map<String, dynamic>? metadata,@JsonKey(name: 'original_url') String? originalUrl,@JsonKey(name: 'author_name') String? authorName,@JsonKey(name: 'author_url') String? authorUrl, String? caption,@JsonKey(name: 'created_at') String createdAt
});




}
/// @nodoc
class _$AttachmentRowCopyWithImpl<$Res>
    implements $AttachmentRowCopyWith<$Res> {
  _$AttachmentRowCopyWithImpl(this._self, this._then);

  final AttachmentRow _self;
  final $Res Function(AttachmentRow) _then;

/// Create a copy of AttachmentRow
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? noteId = null,Object? type = null,Object? storagePath = null,Object? filename = freezed,Object? mimeType = freezed,Object? size = freezed,Object? metadata = freezed,Object? originalUrl = freezed,Object? authorName = freezed,Object? authorUrl = freezed,Object? caption = freezed,Object? createdAt = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,noteId: null == noteId ? _self.noteId : noteId // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as AttachmentType,storagePath: null == storagePath ? _self.storagePath : storagePath // ignore: cast_nullable_to_non_nullable
as String,filename: freezed == filename ? _self.filename : filename // ignore: cast_nullable_to_non_nullable
as String?,mimeType: freezed == mimeType ? _self.mimeType : mimeType // ignore: cast_nullable_to_non_nullable
as String?,size: freezed == size ? _self.size : size // ignore: cast_nullable_to_non_nullable
as int?,metadata: freezed == metadata ? _self.metadata : metadata // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,originalUrl: freezed == originalUrl ? _self.originalUrl : originalUrl // ignore: cast_nullable_to_non_nullable
as String?,authorName: freezed == authorName ? _self.authorName : authorName // ignore: cast_nullable_to_non_nullable
as String?,authorUrl: freezed == authorUrl ? _self.authorUrl : authorUrl // ignore: cast_nullable_to_non_nullable
as String?,caption: freezed == caption ? _self.caption : caption // ignore: cast_nullable_to_non_nullable
as String?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [AttachmentRow].
extension AttachmentRowPatterns on AttachmentRow {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AttachmentRow value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AttachmentRow() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AttachmentRow value)  $default,){
final _that = this;
switch (_that) {
case _AttachmentRow():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AttachmentRow value)?  $default,){
final _that = this;
switch (_that) {
case _AttachmentRow() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id, @JsonKey(name: 'note_id')  String noteId,  AttachmentType type, @JsonKey(name: 'storage_path')  String storagePath,  String? filename, @JsonKey(name: 'mime_type')  String? mimeType,  int? size,  Map<String, dynamic>? metadata, @JsonKey(name: 'original_url')  String? originalUrl, @JsonKey(name: 'author_name')  String? authorName, @JsonKey(name: 'author_url')  String? authorUrl,  String? caption, @JsonKey(name: 'created_at')  String createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AttachmentRow() when $default != null:
return $default(_that.id,_that.noteId,_that.type,_that.storagePath,_that.filename,_that.mimeType,_that.size,_that.metadata,_that.originalUrl,_that.authorName,_that.authorUrl,_that.caption,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id, @JsonKey(name: 'note_id')  String noteId,  AttachmentType type, @JsonKey(name: 'storage_path')  String storagePath,  String? filename, @JsonKey(name: 'mime_type')  String? mimeType,  int? size,  Map<String, dynamic>? metadata, @JsonKey(name: 'original_url')  String? originalUrl, @JsonKey(name: 'author_name')  String? authorName, @JsonKey(name: 'author_url')  String? authorUrl,  String? caption, @JsonKey(name: 'created_at')  String createdAt)  $default,) {final _that = this;
switch (_that) {
case _AttachmentRow():
return $default(_that.id,_that.noteId,_that.type,_that.storagePath,_that.filename,_that.mimeType,_that.size,_that.metadata,_that.originalUrl,_that.authorName,_that.authorUrl,_that.caption,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id, @JsonKey(name: 'note_id')  String noteId,  AttachmentType type, @JsonKey(name: 'storage_path')  String storagePath,  String? filename, @JsonKey(name: 'mime_type')  String? mimeType,  int? size,  Map<String, dynamic>? metadata, @JsonKey(name: 'original_url')  String? originalUrl, @JsonKey(name: 'author_name')  String? authorName, @JsonKey(name: 'author_url')  String? authorUrl,  String? caption, @JsonKey(name: 'created_at')  String createdAt)?  $default,) {final _that = this;
switch (_that) {
case _AttachmentRow() when $default != null:
return $default(_that.id,_that.noteId,_that.type,_that.storagePath,_that.filename,_that.mimeType,_that.size,_that.metadata,_that.originalUrl,_that.authorName,_that.authorUrl,_that.caption,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _AttachmentRow implements AttachmentRow {
  const _AttachmentRow({required this.id, @JsonKey(name: 'note_id') required this.noteId, required this.type, @JsonKey(name: 'storage_path') required this.storagePath, this.filename, @JsonKey(name: 'mime_type') this.mimeType, this.size, final  Map<String, dynamic>? metadata, @JsonKey(name: 'original_url') this.originalUrl, @JsonKey(name: 'author_name') this.authorName, @JsonKey(name: 'author_url') this.authorUrl, this.caption, @JsonKey(name: 'created_at') required this.createdAt}): _metadata = metadata;
  factory _AttachmentRow.fromJson(Map<String, dynamic> json) => _$AttachmentRowFromJson(json);

@override final  String id;
@override@JsonKey(name: 'note_id') final  String noteId;
@override final  AttachmentType type;
@override@JsonKey(name: 'storage_path') final  String storagePath;
@override final  String? filename;
@override@JsonKey(name: 'mime_type') final  String? mimeType;
@override final  int? size;
 final  Map<String, dynamic>? _metadata;
@override Map<String, dynamic>? get metadata {
  final value = _metadata;
  if (value == null) return null;
  if (_metadata is EqualUnmodifiableMapView) return _metadata;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(value);
}

@override@JsonKey(name: 'original_url') final  String? originalUrl;
@override@JsonKey(name: 'author_name') final  String? authorName;
@override@JsonKey(name: 'author_url') final  String? authorUrl;
@override final  String? caption;
@override@JsonKey(name: 'created_at') final  String createdAt;

/// Create a copy of AttachmentRow
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AttachmentRowCopyWith<_AttachmentRow> get copyWith => __$AttachmentRowCopyWithImpl<_AttachmentRow>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AttachmentRowToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _AttachmentRow&&(identical(other.id, id) || other.id == id)&&(identical(other.noteId, noteId) || other.noteId == noteId)&&(identical(other.type, type) || other.type == type)&&(identical(other.storagePath, storagePath) || other.storagePath == storagePath)&&(identical(other.filename, filename) || other.filename == filename)&&(identical(other.mimeType, mimeType) || other.mimeType == mimeType)&&(identical(other.size, size) || other.size == size)&&const DeepCollectionEquality().equals(other._metadata, _metadata)&&(identical(other.originalUrl, originalUrl) || other.originalUrl == originalUrl)&&(identical(other.authorName, authorName) || other.authorName == authorName)&&(identical(other.authorUrl, authorUrl) || other.authorUrl == authorUrl)&&(identical(other.caption, caption) || other.caption == caption)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,noteId,type,storagePath,filename,mimeType,size,const DeepCollectionEquality().hash(_metadata),originalUrl,authorName,authorUrl,caption,createdAt);

@override
String toString() {
  return 'AttachmentRow(id: $id, noteId: $noteId, type: $type, storagePath: $storagePath, filename: $filename, mimeType: $mimeType, size: $size, metadata: $metadata, originalUrl: $originalUrl, authorName: $authorName, authorUrl: $authorUrl, caption: $caption, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$AttachmentRowCopyWith<$Res> implements $AttachmentRowCopyWith<$Res> {
  factory _$AttachmentRowCopyWith(_AttachmentRow value, $Res Function(_AttachmentRow) _then) = __$AttachmentRowCopyWithImpl;
@override @useResult
$Res call({
 String id,@JsonKey(name: 'note_id') String noteId, AttachmentType type,@JsonKey(name: 'storage_path') String storagePath, String? filename,@JsonKey(name: 'mime_type') String? mimeType, int? size, Map<String, dynamic>? metadata,@JsonKey(name: 'original_url') String? originalUrl,@JsonKey(name: 'author_name') String? authorName,@JsonKey(name: 'author_url') String? authorUrl, String? caption,@JsonKey(name: 'created_at') String createdAt
});




}
/// @nodoc
class __$AttachmentRowCopyWithImpl<$Res>
    implements _$AttachmentRowCopyWith<$Res> {
  __$AttachmentRowCopyWithImpl(this._self, this._then);

  final _AttachmentRow _self;
  final $Res Function(_AttachmentRow) _then;

/// Create a copy of AttachmentRow
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? noteId = null,Object? type = null,Object? storagePath = null,Object? filename = freezed,Object? mimeType = freezed,Object? size = freezed,Object? metadata = freezed,Object? originalUrl = freezed,Object? authorName = freezed,Object? authorUrl = freezed,Object? caption = freezed,Object? createdAt = null,}) {
  return _then(_AttachmentRow(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,noteId: null == noteId ? _self.noteId : noteId // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as AttachmentType,storagePath: null == storagePath ? _self.storagePath : storagePath // ignore: cast_nullable_to_non_nullable
as String,filename: freezed == filename ? _self.filename : filename // ignore: cast_nullable_to_non_nullable
as String?,mimeType: freezed == mimeType ? _self.mimeType : mimeType // ignore: cast_nullable_to_non_nullable
as String?,size: freezed == size ? _self.size : size // ignore: cast_nullable_to_non_nullable
as int?,metadata: freezed == metadata ? _self._metadata : metadata // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,originalUrl: freezed == originalUrl ? _self.originalUrl : originalUrl // ignore: cast_nullable_to_non_nullable
as String?,authorName: freezed == authorName ? _self.authorName : authorName // ignore: cast_nullable_to_non_nullable
as String?,authorUrl: freezed == authorUrl ? _self.authorUrl : authorUrl // ignore: cast_nullable_to_non_nullable
as String?,caption: freezed == caption ? _self.caption : caption // ignore: cast_nullable_to_non_nullable
as String?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc
mixin _$Attachment {

 String get id; String get noteId; AttachmentType get type; String get storagePath; String? get filename; String? get mimeType; int? get size; Map<String, dynamic>? get metadata; String? get originalUrl; String? get authorName; String? get authorUrl; String? get caption; DateTime get createdAt;
/// Create a copy of Attachment
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AttachmentCopyWith<Attachment> get copyWith => _$AttachmentCopyWithImpl<Attachment>(this as Attachment, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Attachment&&(identical(other.id, id) || other.id == id)&&(identical(other.noteId, noteId) || other.noteId == noteId)&&(identical(other.type, type) || other.type == type)&&(identical(other.storagePath, storagePath) || other.storagePath == storagePath)&&(identical(other.filename, filename) || other.filename == filename)&&(identical(other.mimeType, mimeType) || other.mimeType == mimeType)&&(identical(other.size, size) || other.size == size)&&const DeepCollectionEquality().equals(other.metadata, metadata)&&(identical(other.originalUrl, originalUrl) || other.originalUrl == originalUrl)&&(identical(other.authorName, authorName) || other.authorName == authorName)&&(identical(other.authorUrl, authorUrl) || other.authorUrl == authorUrl)&&(identical(other.caption, caption) || other.caption == caption)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}


@override
int get hashCode => Object.hash(runtimeType,id,noteId,type,storagePath,filename,mimeType,size,const DeepCollectionEquality().hash(metadata),originalUrl,authorName,authorUrl,caption,createdAt);

@override
String toString() {
  return 'Attachment(id: $id, noteId: $noteId, type: $type, storagePath: $storagePath, filename: $filename, mimeType: $mimeType, size: $size, metadata: $metadata, originalUrl: $originalUrl, authorName: $authorName, authorUrl: $authorUrl, caption: $caption, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $AttachmentCopyWith<$Res>  {
  factory $AttachmentCopyWith(Attachment value, $Res Function(Attachment) _then) = _$AttachmentCopyWithImpl;
@useResult
$Res call({
 String id, String noteId, AttachmentType type, String storagePath, String? filename, String? mimeType, int? size, Map<String, dynamic>? metadata, String? originalUrl, String? authorName, String? authorUrl, String? caption, DateTime createdAt
});




}
/// @nodoc
class _$AttachmentCopyWithImpl<$Res>
    implements $AttachmentCopyWith<$Res> {
  _$AttachmentCopyWithImpl(this._self, this._then);

  final Attachment _self;
  final $Res Function(Attachment) _then;

/// Create a copy of Attachment
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? noteId = null,Object? type = null,Object? storagePath = null,Object? filename = freezed,Object? mimeType = freezed,Object? size = freezed,Object? metadata = freezed,Object? originalUrl = freezed,Object? authorName = freezed,Object? authorUrl = freezed,Object? caption = freezed,Object? createdAt = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,noteId: null == noteId ? _self.noteId : noteId // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as AttachmentType,storagePath: null == storagePath ? _self.storagePath : storagePath // ignore: cast_nullable_to_non_nullable
as String,filename: freezed == filename ? _self.filename : filename // ignore: cast_nullable_to_non_nullable
as String?,mimeType: freezed == mimeType ? _self.mimeType : mimeType // ignore: cast_nullable_to_non_nullable
as String?,size: freezed == size ? _self.size : size // ignore: cast_nullable_to_non_nullable
as int?,metadata: freezed == metadata ? _self.metadata : metadata // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,originalUrl: freezed == originalUrl ? _self.originalUrl : originalUrl // ignore: cast_nullable_to_non_nullable
as String?,authorName: freezed == authorName ? _self.authorName : authorName // ignore: cast_nullable_to_non_nullable
as String?,authorUrl: freezed == authorUrl ? _self.authorUrl : authorUrl // ignore: cast_nullable_to_non_nullable
as String?,caption: freezed == caption ? _self.caption : caption // ignore: cast_nullable_to_non_nullable
as String?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}

}


/// Adds pattern-matching-related methods to [Attachment].
extension AttachmentPatterns on Attachment {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Attachment value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Attachment() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Attachment value)  $default,){
final _that = this;
switch (_that) {
case _Attachment():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Attachment value)?  $default,){
final _that = this;
switch (_that) {
case _Attachment() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String noteId,  AttachmentType type,  String storagePath,  String? filename,  String? mimeType,  int? size,  Map<String, dynamic>? metadata,  String? originalUrl,  String? authorName,  String? authorUrl,  String? caption,  DateTime createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Attachment() when $default != null:
return $default(_that.id,_that.noteId,_that.type,_that.storagePath,_that.filename,_that.mimeType,_that.size,_that.metadata,_that.originalUrl,_that.authorName,_that.authorUrl,_that.caption,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String noteId,  AttachmentType type,  String storagePath,  String? filename,  String? mimeType,  int? size,  Map<String, dynamic>? metadata,  String? originalUrl,  String? authorName,  String? authorUrl,  String? caption,  DateTime createdAt)  $default,) {final _that = this;
switch (_that) {
case _Attachment():
return $default(_that.id,_that.noteId,_that.type,_that.storagePath,_that.filename,_that.mimeType,_that.size,_that.metadata,_that.originalUrl,_that.authorName,_that.authorUrl,_that.caption,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String noteId,  AttachmentType type,  String storagePath,  String? filename,  String? mimeType,  int? size,  Map<String, dynamic>? metadata,  String? originalUrl,  String? authorName,  String? authorUrl,  String? caption,  DateTime createdAt)?  $default,) {final _that = this;
switch (_that) {
case _Attachment() when $default != null:
return $default(_that.id,_that.noteId,_that.type,_that.storagePath,_that.filename,_that.mimeType,_that.size,_that.metadata,_that.originalUrl,_that.authorName,_that.authorUrl,_that.caption,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc


class _Attachment extends Attachment {
  const _Attachment({required this.id, required this.noteId, required this.type, required this.storagePath, this.filename, this.mimeType, this.size, final  Map<String, dynamic>? metadata, this.originalUrl, this.authorName, this.authorUrl, this.caption, required this.createdAt}): _metadata = metadata,super._();
  

@override final  String id;
@override final  String noteId;
@override final  AttachmentType type;
@override final  String storagePath;
@override final  String? filename;
@override final  String? mimeType;
@override final  int? size;
 final  Map<String, dynamic>? _metadata;
@override Map<String, dynamic>? get metadata {
  final value = _metadata;
  if (value == null) return null;
  if (_metadata is EqualUnmodifiableMapView) return _metadata;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(value);
}

@override final  String? originalUrl;
@override final  String? authorName;
@override final  String? authorUrl;
@override final  String? caption;
@override final  DateTime createdAt;

/// Create a copy of Attachment
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AttachmentCopyWith<_Attachment> get copyWith => __$AttachmentCopyWithImpl<_Attachment>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Attachment&&(identical(other.id, id) || other.id == id)&&(identical(other.noteId, noteId) || other.noteId == noteId)&&(identical(other.type, type) || other.type == type)&&(identical(other.storagePath, storagePath) || other.storagePath == storagePath)&&(identical(other.filename, filename) || other.filename == filename)&&(identical(other.mimeType, mimeType) || other.mimeType == mimeType)&&(identical(other.size, size) || other.size == size)&&const DeepCollectionEquality().equals(other._metadata, _metadata)&&(identical(other.originalUrl, originalUrl) || other.originalUrl == originalUrl)&&(identical(other.authorName, authorName) || other.authorName == authorName)&&(identical(other.authorUrl, authorUrl) || other.authorUrl == authorUrl)&&(identical(other.caption, caption) || other.caption == caption)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}


@override
int get hashCode => Object.hash(runtimeType,id,noteId,type,storagePath,filename,mimeType,size,const DeepCollectionEquality().hash(_metadata),originalUrl,authorName,authorUrl,caption,createdAt);

@override
String toString() {
  return 'Attachment(id: $id, noteId: $noteId, type: $type, storagePath: $storagePath, filename: $filename, mimeType: $mimeType, size: $size, metadata: $metadata, originalUrl: $originalUrl, authorName: $authorName, authorUrl: $authorUrl, caption: $caption, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$AttachmentCopyWith<$Res> implements $AttachmentCopyWith<$Res> {
  factory _$AttachmentCopyWith(_Attachment value, $Res Function(_Attachment) _then) = __$AttachmentCopyWithImpl;
@override @useResult
$Res call({
 String id, String noteId, AttachmentType type, String storagePath, String? filename, String? mimeType, int? size, Map<String, dynamic>? metadata, String? originalUrl, String? authorName, String? authorUrl, String? caption, DateTime createdAt
});




}
/// @nodoc
class __$AttachmentCopyWithImpl<$Res>
    implements _$AttachmentCopyWith<$Res> {
  __$AttachmentCopyWithImpl(this._self, this._then);

  final _Attachment _self;
  final $Res Function(_Attachment) _then;

/// Create a copy of Attachment
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? noteId = null,Object? type = null,Object? storagePath = null,Object? filename = freezed,Object? mimeType = freezed,Object? size = freezed,Object? metadata = freezed,Object? originalUrl = freezed,Object? authorName = freezed,Object? authorUrl = freezed,Object? caption = freezed,Object? createdAt = null,}) {
  return _then(_Attachment(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,noteId: null == noteId ? _self.noteId : noteId // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as AttachmentType,storagePath: null == storagePath ? _self.storagePath : storagePath // ignore: cast_nullable_to_non_nullable
as String,filename: freezed == filename ? _self.filename : filename // ignore: cast_nullable_to_non_nullable
as String?,mimeType: freezed == mimeType ? _self.mimeType : mimeType // ignore: cast_nullable_to_non_nullable
as String?,size: freezed == size ? _self.size : size // ignore: cast_nullable_to_non_nullable
as int?,metadata: freezed == metadata ? _self._metadata : metadata // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,originalUrl: freezed == originalUrl ? _self.originalUrl : originalUrl // ignore: cast_nullable_to_non_nullable
as String?,authorName: freezed == authorName ? _self.authorName : authorName // ignore: cast_nullable_to_non_nullable
as String?,authorUrl: freezed == authorUrl ? _self.authorUrl : authorUrl // ignore: cast_nullable_to_non_nullable
as String?,caption: freezed == caption ? _self.caption : caption // ignore: cast_nullable_to_non_nullable
as String?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}


}

// dart format on
