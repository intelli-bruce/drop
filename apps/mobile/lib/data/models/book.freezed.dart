// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'book.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$BookRow {

 String get id; String get isbn13; String get title; String get author; String? get publisher;@JsonKey(name: 'pub_date') String? get pubDate; String? get description;@JsonKey(name: 'cover_storage_path') String? get coverStoragePath;@JsonKey(name: 'cover_url') String? get coverUrl;@JsonKey(name: 'reading_status') ReadingStatus get readingStatus;@JsonKey(name: 'started_at') String? get startedAt;@JsonKey(name: 'finished_at') String? get finishedAt; int? get rating;@JsonKey(name: 'created_at') String get createdAt;@JsonKey(name: 'updated_at') String get updatedAt;
/// Create a copy of BookRow
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$BookRowCopyWith<BookRow> get copyWith => _$BookRowCopyWithImpl<BookRow>(this as BookRow, _$identity);

  /// Serializes this BookRow to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is BookRow&&(identical(other.id, id) || other.id == id)&&(identical(other.isbn13, isbn13) || other.isbn13 == isbn13)&&(identical(other.title, title) || other.title == title)&&(identical(other.author, author) || other.author == author)&&(identical(other.publisher, publisher) || other.publisher == publisher)&&(identical(other.pubDate, pubDate) || other.pubDate == pubDate)&&(identical(other.description, description) || other.description == description)&&(identical(other.coverStoragePath, coverStoragePath) || other.coverStoragePath == coverStoragePath)&&(identical(other.coverUrl, coverUrl) || other.coverUrl == coverUrl)&&(identical(other.readingStatus, readingStatus) || other.readingStatus == readingStatus)&&(identical(other.startedAt, startedAt) || other.startedAt == startedAt)&&(identical(other.finishedAt, finishedAt) || other.finishedAt == finishedAt)&&(identical(other.rating, rating) || other.rating == rating)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,isbn13,title,author,publisher,pubDate,description,coverStoragePath,coverUrl,readingStatus,startedAt,finishedAt,rating,createdAt,updatedAt);

@override
String toString() {
  return 'BookRow(id: $id, isbn13: $isbn13, title: $title, author: $author, publisher: $publisher, pubDate: $pubDate, description: $description, coverStoragePath: $coverStoragePath, coverUrl: $coverUrl, readingStatus: $readingStatus, startedAt: $startedAt, finishedAt: $finishedAt, rating: $rating, createdAt: $createdAt, updatedAt: $updatedAt)';
}


}

/// @nodoc
abstract mixin class $BookRowCopyWith<$Res>  {
  factory $BookRowCopyWith(BookRow value, $Res Function(BookRow) _then) = _$BookRowCopyWithImpl;
@useResult
$Res call({
 String id, String isbn13, String title, String author, String? publisher,@JsonKey(name: 'pub_date') String? pubDate, String? description,@JsonKey(name: 'cover_storage_path') String? coverStoragePath,@JsonKey(name: 'cover_url') String? coverUrl,@JsonKey(name: 'reading_status') ReadingStatus readingStatus,@JsonKey(name: 'started_at') String? startedAt,@JsonKey(name: 'finished_at') String? finishedAt, int? rating,@JsonKey(name: 'created_at') String createdAt,@JsonKey(name: 'updated_at') String updatedAt
});




}
/// @nodoc
class _$BookRowCopyWithImpl<$Res>
    implements $BookRowCopyWith<$Res> {
  _$BookRowCopyWithImpl(this._self, this._then);

  final BookRow _self;
  final $Res Function(BookRow) _then;

/// Create a copy of BookRow
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? isbn13 = null,Object? title = null,Object? author = null,Object? publisher = freezed,Object? pubDate = freezed,Object? description = freezed,Object? coverStoragePath = freezed,Object? coverUrl = freezed,Object? readingStatus = null,Object? startedAt = freezed,Object? finishedAt = freezed,Object? rating = freezed,Object? createdAt = null,Object? updatedAt = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,isbn13: null == isbn13 ? _self.isbn13 : isbn13 // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,author: null == author ? _self.author : author // ignore: cast_nullable_to_non_nullable
as String,publisher: freezed == publisher ? _self.publisher : publisher // ignore: cast_nullable_to_non_nullable
as String?,pubDate: freezed == pubDate ? _self.pubDate : pubDate // ignore: cast_nullable_to_non_nullable
as String?,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,coverStoragePath: freezed == coverStoragePath ? _self.coverStoragePath : coverStoragePath // ignore: cast_nullable_to_non_nullable
as String?,coverUrl: freezed == coverUrl ? _self.coverUrl : coverUrl // ignore: cast_nullable_to_non_nullable
as String?,readingStatus: null == readingStatus ? _self.readingStatus : readingStatus // ignore: cast_nullable_to_non_nullable
as ReadingStatus,startedAt: freezed == startedAt ? _self.startedAt : startedAt // ignore: cast_nullable_to_non_nullable
as String?,finishedAt: freezed == finishedAt ? _self.finishedAt : finishedAt // ignore: cast_nullable_to_non_nullable
as String?,rating: freezed == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as int?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,updatedAt: null == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [BookRow].
extension BookRowPatterns on BookRow {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _BookRow value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _BookRow() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _BookRow value)  $default,){
final _that = this;
switch (_that) {
case _BookRow():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _BookRow value)?  $default,){
final _that = this;
switch (_that) {
case _BookRow() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String isbn13,  String title,  String author,  String? publisher, @JsonKey(name: 'pub_date')  String? pubDate,  String? description, @JsonKey(name: 'cover_storage_path')  String? coverStoragePath, @JsonKey(name: 'cover_url')  String? coverUrl, @JsonKey(name: 'reading_status')  ReadingStatus readingStatus, @JsonKey(name: 'started_at')  String? startedAt, @JsonKey(name: 'finished_at')  String? finishedAt,  int? rating, @JsonKey(name: 'created_at')  String createdAt, @JsonKey(name: 'updated_at')  String updatedAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _BookRow() when $default != null:
return $default(_that.id,_that.isbn13,_that.title,_that.author,_that.publisher,_that.pubDate,_that.description,_that.coverStoragePath,_that.coverUrl,_that.readingStatus,_that.startedAt,_that.finishedAt,_that.rating,_that.createdAt,_that.updatedAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String isbn13,  String title,  String author,  String? publisher, @JsonKey(name: 'pub_date')  String? pubDate,  String? description, @JsonKey(name: 'cover_storage_path')  String? coverStoragePath, @JsonKey(name: 'cover_url')  String? coverUrl, @JsonKey(name: 'reading_status')  ReadingStatus readingStatus, @JsonKey(name: 'started_at')  String? startedAt, @JsonKey(name: 'finished_at')  String? finishedAt,  int? rating, @JsonKey(name: 'created_at')  String createdAt, @JsonKey(name: 'updated_at')  String updatedAt)  $default,) {final _that = this;
switch (_that) {
case _BookRow():
return $default(_that.id,_that.isbn13,_that.title,_that.author,_that.publisher,_that.pubDate,_that.description,_that.coverStoragePath,_that.coverUrl,_that.readingStatus,_that.startedAt,_that.finishedAt,_that.rating,_that.createdAt,_that.updatedAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String isbn13,  String title,  String author,  String? publisher, @JsonKey(name: 'pub_date')  String? pubDate,  String? description, @JsonKey(name: 'cover_storage_path')  String? coverStoragePath, @JsonKey(name: 'cover_url')  String? coverUrl, @JsonKey(name: 'reading_status')  ReadingStatus readingStatus, @JsonKey(name: 'started_at')  String? startedAt, @JsonKey(name: 'finished_at')  String? finishedAt,  int? rating, @JsonKey(name: 'created_at')  String createdAt, @JsonKey(name: 'updated_at')  String updatedAt)?  $default,) {final _that = this;
switch (_that) {
case _BookRow() when $default != null:
return $default(_that.id,_that.isbn13,_that.title,_that.author,_that.publisher,_that.pubDate,_that.description,_that.coverStoragePath,_that.coverUrl,_that.readingStatus,_that.startedAt,_that.finishedAt,_that.rating,_that.createdAt,_that.updatedAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _BookRow implements BookRow {
  const _BookRow({required this.id, required this.isbn13, required this.title, required this.author, this.publisher, @JsonKey(name: 'pub_date') this.pubDate, this.description, @JsonKey(name: 'cover_storage_path') this.coverStoragePath, @JsonKey(name: 'cover_url') this.coverUrl, @JsonKey(name: 'reading_status') required this.readingStatus, @JsonKey(name: 'started_at') this.startedAt, @JsonKey(name: 'finished_at') this.finishedAt, this.rating, @JsonKey(name: 'created_at') required this.createdAt, @JsonKey(name: 'updated_at') required this.updatedAt});
  factory _BookRow.fromJson(Map<String, dynamic> json) => _$BookRowFromJson(json);

@override final  String id;
@override final  String isbn13;
@override final  String title;
@override final  String author;
@override final  String? publisher;
@override@JsonKey(name: 'pub_date') final  String? pubDate;
@override final  String? description;
@override@JsonKey(name: 'cover_storage_path') final  String? coverStoragePath;
@override@JsonKey(name: 'cover_url') final  String? coverUrl;
@override@JsonKey(name: 'reading_status') final  ReadingStatus readingStatus;
@override@JsonKey(name: 'started_at') final  String? startedAt;
@override@JsonKey(name: 'finished_at') final  String? finishedAt;
@override final  int? rating;
@override@JsonKey(name: 'created_at') final  String createdAt;
@override@JsonKey(name: 'updated_at') final  String updatedAt;

/// Create a copy of BookRow
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$BookRowCopyWith<_BookRow> get copyWith => __$BookRowCopyWithImpl<_BookRow>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$BookRowToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _BookRow&&(identical(other.id, id) || other.id == id)&&(identical(other.isbn13, isbn13) || other.isbn13 == isbn13)&&(identical(other.title, title) || other.title == title)&&(identical(other.author, author) || other.author == author)&&(identical(other.publisher, publisher) || other.publisher == publisher)&&(identical(other.pubDate, pubDate) || other.pubDate == pubDate)&&(identical(other.description, description) || other.description == description)&&(identical(other.coverStoragePath, coverStoragePath) || other.coverStoragePath == coverStoragePath)&&(identical(other.coverUrl, coverUrl) || other.coverUrl == coverUrl)&&(identical(other.readingStatus, readingStatus) || other.readingStatus == readingStatus)&&(identical(other.startedAt, startedAt) || other.startedAt == startedAt)&&(identical(other.finishedAt, finishedAt) || other.finishedAt == finishedAt)&&(identical(other.rating, rating) || other.rating == rating)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,isbn13,title,author,publisher,pubDate,description,coverStoragePath,coverUrl,readingStatus,startedAt,finishedAt,rating,createdAt,updatedAt);

@override
String toString() {
  return 'BookRow(id: $id, isbn13: $isbn13, title: $title, author: $author, publisher: $publisher, pubDate: $pubDate, description: $description, coverStoragePath: $coverStoragePath, coverUrl: $coverUrl, readingStatus: $readingStatus, startedAt: $startedAt, finishedAt: $finishedAt, rating: $rating, createdAt: $createdAt, updatedAt: $updatedAt)';
}


}

/// @nodoc
abstract mixin class _$BookRowCopyWith<$Res> implements $BookRowCopyWith<$Res> {
  factory _$BookRowCopyWith(_BookRow value, $Res Function(_BookRow) _then) = __$BookRowCopyWithImpl;
@override @useResult
$Res call({
 String id, String isbn13, String title, String author, String? publisher,@JsonKey(name: 'pub_date') String? pubDate, String? description,@JsonKey(name: 'cover_storage_path') String? coverStoragePath,@JsonKey(name: 'cover_url') String? coverUrl,@JsonKey(name: 'reading_status') ReadingStatus readingStatus,@JsonKey(name: 'started_at') String? startedAt,@JsonKey(name: 'finished_at') String? finishedAt, int? rating,@JsonKey(name: 'created_at') String createdAt,@JsonKey(name: 'updated_at') String updatedAt
});




}
/// @nodoc
class __$BookRowCopyWithImpl<$Res>
    implements _$BookRowCopyWith<$Res> {
  __$BookRowCopyWithImpl(this._self, this._then);

  final _BookRow _self;
  final $Res Function(_BookRow) _then;

/// Create a copy of BookRow
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? isbn13 = null,Object? title = null,Object? author = null,Object? publisher = freezed,Object? pubDate = freezed,Object? description = freezed,Object? coverStoragePath = freezed,Object? coverUrl = freezed,Object? readingStatus = null,Object? startedAt = freezed,Object? finishedAt = freezed,Object? rating = freezed,Object? createdAt = null,Object? updatedAt = null,}) {
  return _then(_BookRow(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,isbn13: null == isbn13 ? _self.isbn13 : isbn13 // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,author: null == author ? _self.author : author // ignore: cast_nullable_to_non_nullable
as String,publisher: freezed == publisher ? _self.publisher : publisher // ignore: cast_nullable_to_non_nullable
as String?,pubDate: freezed == pubDate ? _self.pubDate : pubDate // ignore: cast_nullable_to_non_nullable
as String?,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,coverStoragePath: freezed == coverStoragePath ? _self.coverStoragePath : coverStoragePath // ignore: cast_nullable_to_non_nullable
as String?,coverUrl: freezed == coverUrl ? _self.coverUrl : coverUrl // ignore: cast_nullable_to_non_nullable
as String?,readingStatus: null == readingStatus ? _self.readingStatus : readingStatus // ignore: cast_nullable_to_non_nullable
as ReadingStatus,startedAt: freezed == startedAt ? _self.startedAt : startedAt // ignore: cast_nullable_to_non_nullable
as String?,finishedAt: freezed == finishedAt ? _self.finishedAt : finishedAt // ignore: cast_nullable_to_non_nullable
as String?,rating: freezed == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as int?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,updatedAt: null == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc
mixin _$Book {

 String get id; String get isbn13; String get title; String get author; String? get publisher; String? get pubDate; String? get description; String? get coverStoragePath; String? get coverUrl; ReadingStatus get readingStatus; DateTime? get startedAt; DateTime? get finishedAt; int? get rating; DateTime get createdAt; DateTime get updatedAt;
/// Create a copy of Book
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$BookCopyWith<Book> get copyWith => _$BookCopyWithImpl<Book>(this as Book, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Book&&(identical(other.id, id) || other.id == id)&&(identical(other.isbn13, isbn13) || other.isbn13 == isbn13)&&(identical(other.title, title) || other.title == title)&&(identical(other.author, author) || other.author == author)&&(identical(other.publisher, publisher) || other.publisher == publisher)&&(identical(other.pubDate, pubDate) || other.pubDate == pubDate)&&(identical(other.description, description) || other.description == description)&&(identical(other.coverStoragePath, coverStoragePath) || other.coverStoragePath == coverStoragePath)&&(identical(other.coverUrl, coverUrl) || other.coverUrl == coverUrl)&&(identical(other.readingStatus, readingStatus) || other.readingStatus == readingStatus)&&(identical(other.startedAt, startedAt) || other.startedAt == startedAt)&&(identical(other.finishedAt, finishedAt) || other.finishedAt == finishedAt)&&(identical(other.rating, rating) || other.rating == rating)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt));
}


@override
int get hashCode => Object.hash(runtimeType,id,isbn13,title,author,publisher,pubDate,description,coverStoragePath,coverUrl,readingStatus,startedAt,finishedAt,rating,createdAt,updatedAt);

@override
String toString() {
  return 'Book(id: $id, isbn13: $isbn13, title: $title, author: $author, publisher: $publisher, pubDate: $pubDate, description: $description, coverStoragePath: $coverStoragePath, coverUrl: $coverUrl, readingStatus: $readingStatus, startedAt: $startedAt, finishedAt: $finishedAt, rating: $rating, createdAt: $createdAt, updatedAt: $updatedAt)';
}


}

/// @nodoc
abstract mixin class $BookCopyWith<$Res>  {
  factory $BookCopyWith(Book value, $Res Function(Book) _then) = _$BookCopyWithImpl;
@useResult
$Res call({
 String id, String isbn13, String title, String author, String? publisher, String? pubDate, String? description, String? coverStoragePath, String? coverUrl, ReadingStatus readingStatus, DateTime? startedAt, DateTime? finishedAt, int? rating, DateTime createdAt, DateTime updatedAt
});




}
/// @nodoc
class _$BookCopyWithImpl<$Res>
    implements $BookCopyWith<$Res> {
  _$BookCopyWithImpl(this._self, this._then);

  final Book _self;
  final $Res Function(Book) _then;

/// Create a copy of Book
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? isbn13 = null,Object? title = null,Object? author = null,Object? publisher = freezed,Object? pubDate = freezed,Object? description = freezed,Object? coverStoragePath = freezed,Object? coverUrl = freezed,Object? readingStatus = null,Object? startedAt = freezed,Object? finishedAt = freezed,Object? rating = freezed,Object? createdAt = null,Object? updatedAt = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,isbn13: null == isbn13 ? _self.isbn13 : isbn13 // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,author: null == author ? _self.author : author // ignore: cast_nullable_to_non_nullable
as String,publisher: freezed == publisher ? _self.publisher : publisher // ignore: cast_nullable_to_non_nullable
as String?,pubDate: freezed == pubDate ? _self.pubDate : pubDate // ignore: cast_nullable_to_non_nullable
as String?,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,coverStoragePath: freezed == coverStoragePath ? _self.coverStoragePath : coverStoragePath // ignore: cast_nullable_to_non_nullable
as String?,coverUrl: freezed == coverUrl ? _self.coverUrl : coverUrl // ignore: cast_nullable_to_non_nullable
as String?,readingStatus: null == readingStatus ? _self.readingStatus : readingStatus // ignore: cast_nullable_to_non_nullable
as ReadingStatus,startedAt: freezed == startedAt ? _self.startedAt : startedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,finishedAt: freezed == finishedAt ? _self.finishedAt : finishedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,rating: freezed == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as int?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,updatedAt: null == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}

}


/// Adds pattern-matching-related methods to [Book].
extension BookPatterns on Book {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Book value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Book() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Book value)  $default,){
final _that = this;
switch (_that) {
case _Book():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Book value)?  $default,){
final _that = this;
switch (_that) {
case _Book() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String isbn13,  String title,  String author,  String? publisher,  String? pubDate,  String? description,  String? coverStoragePath,  String? coverUrl,  ReadingStatus readingStatus,  DateTime? startedAt,  DateTime? finishedAt,  int? rating,  DateTime createdAt,  DateTime updatedAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Book() when $default != null:
return $default(_that.id,_that.isbn13,_that.title,_that.author,_that.publisher,_that.pubDate,_that.description,_that.coverStoragePath,_that.coverUrl,_that.readingStatus,_that.startedAt,_that.finishedAt,_that.rating,_that.createdAt,_that.updatedAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String isbn13,  String title,  String author,  String? publisher,  String? pubDate,  String? description,  String? coverStoragePath,  String? coverUrl,  ReadingStatus readingStatus,  DateTime? startedAt,  DateTime? finishedAt,  int? rating,  DateTime createdAt,  DateTime updatedAt)  $default,) {final _that = this;
switch (_that) {
case _Book():
return $default(_that.id,_that.isbn13,_that.title,_that.author,_that.publisher,_that.pubDate,_that.description,_that.coverStoragePath,_that.coverUrl,_that.readingStatus,_that.startedAt,_that.finishedAt,_that.rating,_that.createdAt,_that.updatedAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String isbn13,  String title,  String author,  String? publisher,  String? pubDate,  String? description,  String? coverStoragePath,  String? coverUrl,  ReadingStatus readingStatus,  DateTime? startedAt,  DateTime? finishedAt,  int? rating,  DateTime createdAt,  DateTime updatedAt)?  $default,) {final _that = this;
switch (_that) {
case _Book() when $default != null:
return $default(_that.id,_that.isbn13,_that.title,_that.author,_that.publisher,_that.pubDate,_that.description,_that.coverStoragePath,_that.coverUrl,_that.readingStatus,_that.startedAt,_that.finishedAt,_that.rating,_that.createdAt,_that.updatedAt);case _:
  return null;

}
}

}

/// @nodoc


class _Book extends Book {
  const _Book({required this.id, required this.isbn13, required this.title, required this.author, this.publisher, this.pubDate, this.description, this.coverStoragePath, this.coverUrl, required this.readingStatus, this.startedAt, this.finishedAt, this.rating, required this.createdAt, required this.updatedAt}): super._();
  

@override final  String id;
@override final  String isbn13;
@override final  String title;
@override final  String author;
@override final  String? publisher;
@override final  String? pubDate;
@override final  String? description;
@override final  String? coverStoragePath;
@override final  String? coverUrl;
@override final  ReadingStatus readingStatus;
@override final  DateTime? startedAt;
@override final  DateTime? finishedAt;
@override final  int? rating;
@override final  DateTime createdAt;
@override final  DateTime updatedAt;

/// Create a copy of Book
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$BookCopyWith<_Book> get copyWith => __$BookCopyWithImpl<_Book>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Book&&(identical(other.id, id) || other.id == id)&&(identical(other.isbn13, isbn13) || other.isbn13 == isbn13)&&(identical(other.title, title) || other.title == title)&&(identical(other.author, author) || other.author == author)&&(identical(other.publisher, publisher) || other.publisher == publisher)&&(identical(other.pubDate, pubDate) || other.pubDate == pubDate)&&(identical(other.description, description) || other.description == description)&&(identical(other.coverStoragePath, coverStoragePath) || other.coverStoragePath == coverStoragePath)&&(identical(other.coverUrl, coverUrl) || other.coverUrl == coverUrl)&&(identical(other.readingStatus, readingStatus) || other.readingStatus == readingStatus)&&(identical(other.startedAt, startedAt) || other.startedAt == startedAt)&&(identical(other.finishedAt, finishedAt) || other.finishedAt == finishedAt)&&(identical(other.rating, rating) || other.rating == rating)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt));
}


@override
int get hashCode => Object.hash(runtimeType,id,isbn13,title,author,publisher,pubDate,description,coverStoragePath,coverUrl,readingStatus,startedAt,finishedAt,rating,createdAt,updatedAt);

@override
String toString() {
  return 'Book(id: $id, isbn13: $isbn13, title: $title, author: $author, publisher: $publisher, pubDate: $pubDate, description: $description, coverStoragePath: $coverStoragePath, coverUrl: $coverUrl, readingStatus: $readingStatus, startedAt: $startedAt, finishedAt: $finishedAt, rating: $rating, createdAt: $createdAt, updatedAt: $updatedAt)';
}


}

/// @nodoc
abstract mixin class _$BookCopyWith<$Res> implements $BookCopyWith<$Res> {
  factory _$BookCopyWith(_Book value, $Res Function(_Book) _then) = __$BookCopyWithImpl;
@override @useResult
$Res call({
 String id, String isbn13, String title, String author, String? publisher, String? pubDate, String? description, String? coverStoragePath, String? coverUrl, ReadingStatus readingStatus, DateTime? startedAt, DateTime? finishedAt, int? rating, DateTime createdAt, DateTime updatedAt
});




}
/// @nodoc
class __$BookCopyWithImpl<$Res>
    implements _$BookCopyWith<$Res> {
  __$BookCopyWithImpl(this._self, this._then);

  final _Book _self;
  final $Res Function(_Book) _then;

/// Create a copy of Book
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? isbn13 = null,Object? title = null,Object? author = null,Object? publisher = freezed,Object? pubDate = freezed,Object? description = freezed,Object? coverStoragePath = freezed,Object? coverUrl = freezed,Object? readingStatus = null,Object? startedAt = freezed,Object? finishedAt = freezed,Object? rating = freezed,Object? createdAt = null,Object? updatedAt = null,}) {
  return _then(_Book(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,isbn13: null == isbn13 ? _self.isbn13 : isbn13 // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,author: null == author ? _self.author : author // ignore: cast_nullable_to_non_nullable
as String,publisher: freezed == publisher ? _self.publisher : publisher // ignore: cast_nullable_to_non_nullable
as String?,pubDate: freezed == pubDate ? _self.pubDate : pubDate // ignore: cast_nullable_to_non_nullable
as String?,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,coverStoragePath: freezed == coverStoragePath ? _self.coverStoragePath : coverStoragePath // ignore: cast_nullable_to_non_nullable
as String?,coverUrl: freezed == coverUrl ? _self.coverUrl : coverUrl // ignore: cast_nullable_to_non_nullable
as String?,readingStatus: null == readingStatus ? _self.readingStatus : readingStatus // ignore: cast_nullable_to_non_nullable
as ReadingStatus,startedAt: freezed == startedAt ? _self.startedAt : startedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,finishedAt: freezed == finishedAt ? _self.finishedAt : finishedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,rating: freezed == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as int?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,updatedAt: null == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}


}

// dart format on
