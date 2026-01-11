// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'book_search_result.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$BookSearchResult {

 String get isbn13; String? get isbn10; String get title; String get author; String get publisher; String? get pubDate; String? get description; String? get thumbnail; String? get cover; BookSearchSource get source; String? get sourceId; String? get link; int? get priceStandard; int? get priceSales; String? get category;
/// Create a copy of BookSearchResult
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$BookSearchResultCopyWith<BookSearchResult> get copyWith => _$BookSearchResultCopyWithImpl<BookSearchResult>(this as BookSearchResult, _$identity);

  /// Serializes this BookSearchResult to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is BookSearchResult&&(identical(other.isbn13, isbn13) || other.isbn13 == isbn13)&&(identical(other.isbn10, isbn10) || other.isbn10 == isbn10)&&(identical(other.title, title) || other.title == title)&&(identical(other.author, author) || other.author == author)&&(identical(other.publisher, publisher) || other.publisher == publisher)&&(identical(other.pubDate, pubDate) || other.pubDate == pubDate)&&(identical(other.description, description) || other.description == description)&&(identical(other.thumbnail, thumbnail) || other.thumbnail == thumbnail)&&(identical(other.cover, cover) || other.cover == cover)&&(identical(other.source, source) || other.source == source)&&(identical(other.sourceId, sourceId) || other.sourceId == sourceId)&&(identical(other.link, link) || other.link == link)&&(identical(other.priceStandard, priceStandard) || other.priceStandard == priceStandard)&&(identical(other.priceSales, priceSales) || other.priceSales == priceSales)&&(identical(other.category, category) || other.category == category));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,isbn13,isbn10,title,author,publisher,pubDate,description,thumbnail,cover,source,sourceId,link,priceStandard,priceSales,category);

@override
String toString() {
  return 'BookSearchResult(isbn13: $isbn13, isbn10: $isbn10, title: $title, author: $author, publisher: $publisher, pubDate: $pubDate, description: $description, thumbnail: $thumbnail, cover: $cover, source: $source, sourceId: $sourceId, link: $link, priceStandard: $priceStandard, priceSales: $priceSales, category: $category)';
}


}

/// @nodoc
abstract mixin class $BookSearchResultCopyWith<$Res>  {
  factory $BookSearchResultCopyWith(BookSearchResult value, $Res Function(BookSearchResult) _then) = _$BookSearchResultCopyWithImpl;
@useResult
$Res call({
 String isbn13, String? isbn10, String title, String author, String publisher, String? pubDate, String? description, String? thumbnail, String? cover, BookSearchSource source, String? sourceId, String? link, int? priceStandard, int? priceSales, String? category
});




}
/// @nodoc
class _$BookSearchResultCopyWithImpl<$Res>
    implements $BookSearchResultCopyWith<$Res> {
  _$BookSearchResultCopyWithImpl(this._self, this._then);

  final BookSearchResult _self;
  final $Res Function(BookSearchResult) _then;

/// Create a copy of BookSearchResult
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? isbn13 = null,Object? isbn10 = freezed,Object? title = null,Object? author = null,Object? publisher = null,Object? pubDate = freezed,Object? description = freezed,Object? thumbnail = freezed,Object? cover = freezed,Object? source = null,Object? sourceId = freezed,Object? link = freezed,Object? priceStandard = freezed,Object? priceSales = freezed,Object? category = freezed,}) {
  return _then(_self.copyWith(
isbn13: null == isbn13 ? _self.isbn13 : isbn13 // ignore: cast_nullable_to_non_nullable
as String,isbn10: freezed == isbn10 ? _self.isbn10 : isbn10 // ignore: cast_nullable_to_non_nullable
as String?,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,author: null == author ? _self.author : author // ignore: cast_nullable_to_non_nullable
as String,publisher: null == publisher ? _self.publisher : publisher // ignore: cast_nullable_to_non_nullable
as String,pubDate: freezed == pubDate ? _self.pubDate : pubDate // ignore: cast_nullable_to_non_nullable
as String?,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,thumbnail: freezed == thumbnail ? _self.thumbnail : thumbnail // ignore: cast_nullable_to_non_nullable
as String?,cover: freezed == cover ? _self.cover : cover // ignore: cast_nullable_to_non_nullable
as String?,source: null == source ? _self.source : source // ignore: cast_nullable_to_non_nullable
as BookSearchSource,sourceId: freezed == sourceId ? _self.sourceId : sourceId // ignore: cast_nullable_to_non_nullable
as String?,link: freezed == link ? _self.link : link // ignore: cast_nullable_to_non_nullable
as String?,priceStandard: freezed == priceStandard ? _self.priceStandard : priceStandard // ignore: cast_nullable_to_non_nullable
as int?,priceSales: freezed == priceSales ? _self.priceSales : priceSales // ignore: cast_nullable_to_non_nullable
as int?,category: freezed == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [BookSearchResult].
extension BookSearchResultPatterns on BookSearchResult {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _BookSearchResult value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _BookSearchResult() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _BookSearchResult value)  $default,){
final _that = this;
switch (_that) {
case _BookSearchResult():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _BookSearchResult value)?  $default,){
final _that = this;
switch (_that) {
case _BookSearchResult() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String isbn13,  String? isbn10,  String title,  String author,  String publisher,  String? pubDate,  String? description,  String? thumbnail,  String? cover,  BookSearchSource source,  String? sourceId,  String? link,  int? priceStandard,  int? priceSales,  String? category)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _BookSearchResult() when $default != null:
return $default(_that.isbn13,_that.isbn10,_that.title,_that.author,_that.publisher,_that.pubDate,_that.description,_that.thumbnail,_that.cover,_that.source,_that.sourceId,_that.link,_that.priceStandard,_that.priceSales,_that.category);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String isbn13,  String? isbn10,  String title,  String author,  String publisher,  String? pubDate,  String? description,  String? thumbnail,  String? cover,  BookSearchSource source,  String? sourceId,  String? link,  int? priceStandard,  int? priceSales,  String? category)  $default,) {final _that = this;
switch (_that) {
case _BookSearchResult():
return $default(_that.isbn13,_that.isbn10,_that.title,_that.author,_that.publisher,_that.pubDate,_that.description,_that.thumbnail,_that.cover,_that.source,_that.sourceId,_that.link,_that.priceStandard,_that.priceSales,_that.category);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String isbn13,  String? isbn10,  String title,  String author,  String publisher,  String? pubDate,  String? description,  String? thumbnail,  String? cover,  BookSearchSource source,  String? sourceId,  String? link,  int? priceStandard,  int? priceSales,  String? category)?  $default,) {final _that = this;
switch (_that) {
case _BookSearchResult() when $default != null:
return $default(_that.isbn13,_that.isbn10,_that.title,_that.author,_that.publisher,_that.pubDate,_that.description,_that.thumbnail,_that.cover,_that.source,_that.sourceId,_that.link,_that.priceStandard,_that.priceSales,_that.category);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _BookSearchResult extends BookSearchResult {
  const _BookSearchResult({required this.isbn13, this.isbn10, required this.title, required this.author, required this.publisher, this.pubDate, this.description, this.thumbnail, this.cover, required this.source, this.sourceId, this.link, this.priceStandard, this.priceSales, this.category}): super._();
  factory _BookSearchResult.fromJson(Map<String, dynamic> json) => _$BookSearchResultFromJson(json);

@override final  String isbn13;
@override final  String? isbn10;
@override final  String title;
@override final  String author;
@override final  String publisher;
@override final  String? pubDate;
@override final  String? description;
@override final  String? thumbnail;
@override final  String? cover;
@override final  BookSearchSource source;
@override final  String? sourceId;
@override final  String? link;
@override final  int? priceStandard;
@override final  int? priceSales;
@override final  String? category;

/// Create a copy of BookSearchResult
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$BookSearchResultCopyWith<_BookSearchResult> get copyWith => __$BookSearchResultCopyWithImpl<_BookSearchResult>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$BookSearchResultToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _BookSearchResult&&(identical(other.isbn13, isbn13) || other.isbn13 == isbn13)&&(identical(other.isbn10, isbn10) || other.isbn10 == isbn10)&&(identical(other.title, title) || other.title == title)&&(identical(other.author, author) || other.author == author)&&(identical(other.publisher, publisher) || other.publisher == publisher)&&(identical(other.pubDate, pubDate) || other.pubDate == pubDate)&&(identical(other.description, description) || other.description == description)&&(identical(other.thumbnail, thumbnail) || other.thumbnail == thumbnail)&&(identical(other.cover, cover) || other.cover == cover)&&(identical(other.source, source) || other.source == source)&&(identical(other.sourceId, sourceId) || other.sourceId == sourceId)&&(identical(other.link, link) || other.link == link)&&(identical(other.priceStandard, priceStandard) || other.priceStandard == priceStandard)&&(identical(other.priceSales, priceSales) || other.priceSales == priceSales)&&(identical(other.category, category) || other.category == category));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,isbn13,isbn10,title,author,publisher,pubDate,description,thumbnail,cover,source,sourceId,link,priceStandard,priceSales,category);

@override
String toString() {
  return 'BookSearchResult(isbn13: $isbn13, isbn10: $isbn10, title: $title, author: $author, publisher: $publisher, pubDate: $pubDate, description: $description, thumbnail: $thumbnail, cover: $cover, source: $source, sourceId: $sourceId, link: $link, priceStandard: $priceStandard, priceSales: $priceSales, category: $category)';
}


}

/// @nodoc
abstract mixin class _$BookSearchResultCopyWith<$Res> implements $BookSearchResultCopyWith<$Res> {
  factory _$BookSearchResultCopyWith(_BookSearchResult value, $Res Function(_BookSearchResult) _then) = __$BookSearchResultCopyWithImpl;
@override @useResult
$Res call({
 String isbn13, String? isbn10, String title, String author, String publisher, String? pubDate, String? description, String? thumbnail, String? cover, BookSearchSource source, String? sourceId, String? link, int? priceStandard, int? priceSales, String? category
});




}
/// @nodoc
class __$BookSearchResultCopyWithImpl<$Res>
    implements _$BookSearchResultCopyWith<$Res> {
  __$BookSearchResultCopyWithImpl(this._self, this._then);

  final _BookSearchResult _self;
  final $Res Function(_BookSearchResult) _then;

/// Create a copy of BookSearchResult
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? isbn13 = null,Object? isbn10 = freezed,Object? title = null,Object? author = null,Object? publisher = null,Object? pubDate = freezed,Object? description = freezed,Object? thumbnail = freezed,Object? cover = freezed,Object? source = null,Object? sourceId = freezed,Object? link = freezed,Object? priceStandard = freezed,Object? priceSales = freezed,Object? category = freezed,}) {
  return _then(_BookSearchResult(
isbn13: null == isbn13 ? _self.isbn13 : isbn13 // ignore: cast_nullable_to_non_nullable
as String,isbn10: freezed == isbn10 ? _self.isbn10 : isbn10 // ignore: cast_nullable_to_non_nullable
as String?,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,author: null == author ? _self.author : author // ignore: cast_nullable_to_non_nullable
as String,publisher: null == publisher ? _self.publisher : publisher // ignore: cast_nullable_to_non_nullable
as String,pubDate: freezed == pubDate ? _self.pubDate : pubDate // ignore: cast_nullable_to_non_nullable
as String?,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,thumbnail: freezed == thumbnail ? _self.thumbnail : thumbnail // ignore: cast_nullable_to_non_nullable
as String?,cover: freezed == cover ? _self.cover : cover // ignore: cast_nullable_to_non_nullable
as String?,source: null == source ? _self.source : source // ignore: cast_nullable_to_non_nullable
as BookSearchSource,sourceId: freezed == sourceId ? _self.sourceId : sourceId // ignore: cast_nullable_to_non_nullable
as String?,link: freezed == link ? _self.link : link // ignore: cast_nullable_to_non_nullable
as String?,priceStandard: freezed == priceStandard ? _self.priceStandard : priceStandard // ignore: cast_nullable_to_non_nullable
as int?,priceSales: freezed == priceSales ? _self.priceSales : priceSales // ignore: cast_nullable_to_non_nullable
as int?,category: freezed == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
