// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'tag.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$TagRow {

 String get id; String get name;@JsonKey(name: 'created_at') String get createdAt;
/// Create a copy of TagRow
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TagRowCopyWith<TagRow> get copyWith => _$TagRowCopyWithImpl<TagRow>(this as TagRow, _$identity);

  /// Serializes this TagRow to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TagRow&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,createdAt);

@override
String toString() {
  return 'TagRow(id: $id, name: $name, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $TagRowCopyWith<$Res>  {
  factory $TagRowCopyWith(TagRow value, $Res Function(TagRow) _then) = _$TagRowCopyWithImpl;
@useResult
$Res call({
 String id, String name,@JsonKey(name: 'created_at') String createdAt
});




}
/// @nodoc
class _$TagRowCopyWithImpl<$Res>
    implements $TagRowCopyWith<$Res> {
  _$TagRowCopyWithImpl(this._self, this._then);

  final TagRow _self;
  final $Res Function(TagRow) _then;

/// Create a copy of TagRow
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? createdAt = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [TagRow].
extension TagRowPatterns on TagRow {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TagRow value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TagRow() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TagRow value)  $default,){
final _that = this;
switch (_that) {
case _TagRow():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TagRow value)?  $default,){
final _that = this;
switch (_that) {
case _TagRow() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name, @JsonKey(name: 'created_at')  String createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TagRow() when $default != null:
return $default(_that.id,_that.name,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name, @JsonKey(name: 'created_at')  String createdAt)  $default,) {final _that = this;
switch (_that) {
case _TagRow():
return $default(_that.id,_that.name,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name, @JsonKey(name: 'created_at')  String createdAt)?  $default,) {final _that = this;
switch (_that) {
case _TagRow() when $default != null:
return $default(_that.id,_that.name,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _TagRow implements TagRow {
  const _TagRow({required this.id, required this.name, @JsonKey(name: 'created_at') required this.createdAt});
  factory _TagRow.fromJson(Map<String, dynamic> json) => _$TagRowFromJson(json);

@override final  String id;
@override final  String name;
@override@JsonKey(name: 'created_at') final  String createdAt;

/// Create a copy of TagRow
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TagRowCopyWith<_TagRow> get copyWith => __$TagRowCopyWithImpl<_TagRow>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$TagRowToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TagRow&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,createdAt);

@override
String toString() {
  return 'TagRow(id: $id, name: $name, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$TagRowCopyWith<$Res> implements $TagRowCopyWith<$Res> {
  factory _$TagRowCopyWith(_TagRow value, $Res Function(_TagRow) _then) = __$TagRowCopyWithImpl;
@override @useResult
$Res call({
 String id, String name,@JsonKey(name: 'created_at') String createdAt
});




}
/// @nodoc
class __$TagRowCopyWithImpl<$Res>
    implements _$TagRowCopyWith<$Res> {
  __$TagRowCopyWithImpl(this._self, this._then);

  final _TagRow _self;
  final $Res Function(_TagRow) _then;

/// Create a copy of TagRow
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? createdAt = null,}) {
  return _then(_TagRow(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc
mixin _$Tag {

 String get id; String get name; DateTime get createdAt;
/// Create a copy of Tag
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TagCopyWith<Tag> get copyWith => _$TagCopyWithImpl<Tag>(this as Tag, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Tag&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}


@override
int get hashCode => Object.hash(runtimeType,id,name,createdAt);

@override
String toString() {
  return 'Tag(id: $id, name: $name, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $TagCopyWith<$Res>  {
  factory $TagCopyWith(Tag value, $Res Function(Tag) _then) = _$TagCopyWithImpl;
@useResult
$Res call({
 String id, String name, DateTime createdAt
});




}
/// @nodoc
class _$TagCopyWithImpl<$Res>
    implements $TagCopyWith<$Res> {
  _$TagCopyWithImpl(this._self, this._then);

  final Tag _self;
  final $Res Function(Tag) _then;

/// Create a copy of Tag
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? createdAt = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}

}


/// Adds pattern-matching-related methods to [Tag].
extension TagPatterns on Tag {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Tag value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Tag() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Tag value)  $default,){
final _that = this;
switch (_that) {
case _Tag():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Tag value)?  $default,){
final _that = this;
switch (_that) {
case _Tag() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  DateTime createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Tag() when $default != null:
return $default(_that.id,_that.name,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  DateTime createdAt)  $default,) {final _that = this;
switch (_that) {
case _Tag():
return $default(_that.id,_that.name,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  DateTime createdAt)?  $default,) {final _that = this;
switch (_that) {
case _Tag() when $default != null:
return $default(_that.id,_that.name,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc


class _Tag extends Tag {
  const _Tag({required this.id, required this.name, required this.createdAt}): super._();
  

@override final  String id;
@override final  String name;
@override final  DateTime createdAt;

/// Create a copy of Tag
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TagCopyWith<_Tag> get copyWith => __$TagCopyWithImpl<_Tag>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Tag&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}


@override
int get hashCode => Object.hash(runtimeType,id,name,createdAt);

@override
String toString() {
  return 'Tag(id: $id, name: $name, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$TagCopyWith<$Res> implements $TagCopyWith<$Res> {
  factory _$TagCopyWith(_Tag value, $Res Function(_Tag) _then) = __$TagCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, DateTime createdAt
});




}
/// @nodoc
class __$TagCopyWithImpl<$Res>
    implements _$TagCopyWith<$Res> {
  __$TagCopyWithImpl(this._self, this._then);

  final _Tag _self;
  final $Res Function(_Tag) _then;

/// Create a copy of Tag
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? createdAt = null,}) {
  return _then(_Tag(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}


}

// dart format on
