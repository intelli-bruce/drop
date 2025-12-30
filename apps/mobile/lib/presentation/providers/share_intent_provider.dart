import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:receive_sharing_intent/receive_sharing_intent.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'share_intent_provider.g.dart';

/// Shared content from external apps
class SharedContent {
  final List<SharedMediaFile> mediaFiles;
  final String? text;

  const SharedContent({
    this.mediaFiles = const [],
    this.text,
  });

  bool get hasContent => mediaFiles.isNotEmpty || text != null;
  bool get hasMedia => mediaFiles.isNotEmpty;
  bool get hasText => text != null && text!.isNotEmpty;

  SharedContent copyWith({
    List<SharedMediaFile>? mediaFiles,
    String? text,
  }) {
    return SharedContent(
      mediaFiles: mediaFiles ?? this.mediaFiles,
      text: text ?? this.text,
    );
  }

  @override
  String toString() => 'SharedContent(media: ${mediaFiles.length}, text: $text)';
}

/// Provider for handling shared content from iOS Share Extension
@riverpod
class ShareIntent extends _$ShareIntent {
  StreamSubscription<List<SharedMediaFile>>? _mediaSubscription;

  @override
  SharedContent build() {
    _initListeners();

    ref.onDispose(() {
      _mediaSubscription?.cancel();
    });

    return const SharedContent();
  }

  void _initListeners() {
    debugPrint('[ShareIntent] Initializing listeners...');

    // Listen for shared media files (images, videos, files, text, urls)
    _mediaSubscription = ReceiveSharingIntent.instance.getMediaStream().listen(
      (List<SharedMediaFile> files) {
        debugPrint('[ShareIntent] Stream received ${files.length} files');
        for (final f in files) {
          debugPrint('[ShareIntent] - type: ${f.type}, path: ${f.path}');
        }
        if (files.isNotEmpty) {
          _processSharedFiles(files);
        }
      },
      onError: (err) {
        debugPrint('[ShareIntent] Stream error: $err');
      },
    );

    // Get initial shared content (when app opens from share)
    _getInitialSharedContent();
  }

  void _processSharedFiles(List<SharedMediaFile> files) {
    debugPrint('[ShareIntent] Processing ${files.length} files...');
    final mediaFiles = <SharedMediaFile>[];
    String? text;

    for (final file in files) {
      switch (file.type) {
        case SharedMediaType.text:
          // For text type, path contains the text content
          text = file.path;
          break;
        case SharedMediaType.url:
          // For URL type, path contains the URL
          text = (text != null) ? '$text\n${file.path}' : file.path;
          break;
        case SharedMediaType.image:
        case SharedMediaType.video:
        case SharedMediaType.file:
          mediaFiles.add(file);
          break;
      }
    }

    state = SharedContent(
      mediaFiles: mediaFiles,
      text: text,
    );
    debugPrint('[ShareIntent] State updated: ${state.mediaFiles.length} media, text: ${state.text}');
  }

  Future<void> _getInitialSharedContent() async {
    debugPrint('[ShareIntent] Getting initial shared content...');
    final files = await ReceiveSharingIntent.instance.getInitialMedia();
    debugPrint('[ShareIntent] Initial media: ${files.length} files');
    for (final f in files) {
      debugPrint('[ShareIntent] - type: ${f.type}, path: ${f.path}');
    }
    if (files.isNotEmpty) {
      _processSharedFiles(files);
    }
  }

  /// Clear the shared content after it has been processed
  void clearSharedContent() {
    state = const SharedContent();
    ReceiveSharingIntent.instance.reset();
  }
}

/// Provider to check if there's pending shared content
@riverpod
bool hasSharedContent(Ref ref) {
  final sharedContent = ref.watch(shareIntentProvider);
  return sharedContent.hasContent;
}
