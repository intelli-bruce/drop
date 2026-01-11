import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:video_player/video_player.dart';
import 'package:drop_mobile/data/models/models.dart';
import 'package:drop_mobile/data/repositories/attachments_repository.dart';

/// Full-screen media viewer with swipe navigation
class MediaViewer extends ConsumerStatefulWidget {
  final List<Attachment> mediaAttachments;
  final int initialIndex;

  const MediaViewer({
    super.key,
    required this.mediaAttachments,
    this.initialIndex = 0,
  });

  /// Show the media viewer as a full-screen modal
  static Future<void> show(
    BuildContext context, {
    required List<Attachment> mediaAttachments,
    int initialIndex = 0,
  }) {
    return Navigator.of(context).push(
      PageRouteBuilder(
        opaque: false,
        barrierColor: Colors.black,
        pageBuilder: (context, animation, secondaryAnimation) {
          return MediaViewer(
            mediaAttachments: mediaAttachments,
            initialIndex: initialIndex,
          );
        },
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(opacity: animation, child: child);
        },
      ),
    );
  }

  @override
  ConsumerState<MediaViewer> createState() => _MediaViewerState();
}

class _MediaViewerState extends ConsumerState<MediaViewer> {
  late PageController _pageController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);

    // Hide system UI for immersive experience
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  }

  @override
  void dispose() {
    _pageController.dispose();
    // Restore system UI
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Media PageView
          PageView.builder(
            controller: _pageController,
            itemCount: widget.mediaAttachments.length,
            onPageChanged: (index) {
              setState(() => _currentIndex = index);
            },
            itemBuilder: (context, index) {
              final attachment = widget.mediaAttachments[index];
              return _MediaPage(
                attachment: attachment,
                onTap: () => Navigator.of(context).pop(),
              );
            },
          ),

          // Top bar with close button and counter
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Close button
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close, color: Colors.white),
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.black45,
                      ),
                    ),
                    // Page indicator
                    if (widget.mediaAttachments.length > 1)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black45,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          '${_currentIndex + 1} / ${widget.mediaAttachments.length}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    // Placeholder for symmetry
                    const SizedBox(width: 48),
                  ],
                ),
              ),
            ),
          ),

          // Bottom thumbnail bar (for 2+ items)
          if (widget.mediaAttachments.length > 1)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: SafeArea(
                child: Container(
                  height: 80,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.8),
                        Colors.transparent,
                      ],
                    ),
                  ),
                  child: _ThumbnailBar(
                    attachments: widget.mediaAttachments,
                    currentIndex: _currentIndex,
                    onThumbnailTap: (index) {
                      _pageController.animateToPage(
                        index,
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                    },
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Individual media page (image or video)
class _MediaPage extends ConsumerWidget {
  final Attachment attachment;
  final VoidCallback onTap;

  const _MediaPage({required this.attachment, required this.onTap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final urlAsync = ref.watch(
      attachmentSignedUrlProvider(attachment.storagePath),
    );

    return urlAsync.when(
      data: (url) {
        if (attachment.type == AttachmentType.video) {
          return _VideoPlayer(url: url, onTap: onTap);
        } else {
          return _ImageViewer(url: url, onTap: onTap);
        }
      },
      loading: () =>
          const Center(child: CircularProgressIndicator(color: Colors.white)),
      error: (error, stack) => Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, color: Colors.white54, size: 48),
            const SizedBox(height: 16),
            Text('미디어를 불러올 수 없습니다', style: TextStyle(color: Colors.white54)),
          ],
        ),
      ),
    );
  }
}

/// Image viewer with pinch-to-zoom
class _ImageViewer extends StatelessWidget {
  final String url;
  final VoidCallback onTap;

  const _ImageViewer({required this.url, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: InteractiveViewer(
        minScale: 0.5,
        maxScale: 4.0,
        child: Center(
          child: CachedNetworkImage(
            imageUrl: url,
            fit: BoxFit.contain,
            placeholder: (context, url) => const Center(
              child: CircularProgressIndicator(color: Colors.white),
            ),
            errorWidget: (context, url, error) => const Center(
              child: Icon(Icons.broken_image, color: Colors.white54, size: 64),
            ),
          ),
        ),
      ),
    );
  }
}

/// Video player with controls
class _VideoPlayer extends StatefulWidget {
  final String url;
  final VoidCallback onTap;

  const _VideoPlayer({required this.url, required this.onTap});

  @override
  State<_VideoPlayer> createState() => _VideoPlayerState();
}

class _VideoPlayerState extends State<_VideoPlayer> {
  late VideoPlayerController _controller;
  bool _isInitialized = false;
  bool _showControls = true;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _initializePlayer();
  }

  Future<void> _initializePlayer() async {
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.url));

    try {
      await _controller.initialize();
      if (mounted) {
        setState(() => _isInitialized = true);
        _controller.play();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _hasError = true);
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _toggleControls() {
    setState(() => _showControls = !_showControls);
  }

  void _togglePlayPause() {
    setState(() {
      if (_controller.value.isPlaying) {
        _controller.pause();
      } else {
        _controller.play();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_hasError) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, color: Colors.white54, size: 48),
            const SizedBox(height: 16),
            const Text(
              '비디오를 재생할 수 없습니다',
              style: TextStyle(color: Colors.white54),
            ),
          ],
        ),
      );
    }

    if (!_isInitialized) {
      return const Center(
        child: CircularProgressIndicator(color: Colors.white),
      );
    }

    return GestureDetector(
      onTap: _toggleControls,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Video
          Center(
            child: AspectRatio(
              aspectRatio: _controller.value.aspectRatio,
              child: VideoPlayer(_controller),
            ),
          ),

          // Play/Pause overlay
          AnimatedOpacity(
            opacity: _showControls ? 1.0 : 0.0,
            duration: const Duration(milliseconds: 200),
            child: GestureDetector(
              onTap: _togglePlayPause,
              child: Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: Colors.black54,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _controller.value.isPlaying ? Icons.pause : Icons.play_arrow,
                  color: Colors.white,
                  size: 40,
                ),
              ),
            ),
          ),

          // Progress bar
          Positioned(
            bottom: 80,
            left: 24,
            right: 24,
            child: AnimatedOpacity(
              opacity: _showControls ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 200),
              child: VideoProgressIndicator(
                _controller,
                allowScrubbing: true,
                colors: const VideoProgressColors(
                  playedColor: Color(0xFF4A9EFF),
                  bufferedColor: Colors.white38,
                  backgroundColor: Colors.white24,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Horizontal scrollable thumbnail bar
class _ThumbnailBar extends ConsumerStatefulWidget {
  final List<Attachment> attachments;
  final int currentIndex;
  final ValueChanged<int> onThumbnailTap;

  const _ThumbnailBar({
    required this.attachments,
    required this.currentIndex,
    required this.onThumbnailTap,
  });

  @override
  ConsumerState<_ThumbnailBar> createState() => _ThumbnailBarState();
}

class _ThumbnailBarState extends ConsumerState<_ThumbnailBar> {
  late ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    // Scroll to current item after layout
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToIndex(widget.currentIndex, animated: false);
    });
  }

  @override
  void didUpdateWidget(covariant _ThumbnailBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.currentIndex != widget.currentIndex) {
      _scrollToIndex(widget.currentIndex, animated: true);
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToIndex(int index, {bool animated = true}) {
    if (!_scrollController.hasClients) return;

    const itemWidth = 60.0;
    const itemMargin = 8.0;
    final screenWidth = MediaQuery.of(context).size.width;
    final targetOffset = (index * (itemWidth + itemMargin)) -
        (screenWidth / 2) +
        (itemWidth / 2);
    final maxOffset = _scrollController.position.maxScrollExtent;
    final clampedOffset = targetOffset.clamp(0.0, maxOffset);

    if (animated) {
      _scrollController.animateTo(
        clampedOffset,
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeInOut,
      );
    } else {
      _scrollController.jumpTo(clampedOffset);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: _scrollController,
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: widget.attachments.length,
      itemBuilder: (context, index) {
        final attachment = widget.attachments[index];
        final isSelected = index == widget.currentIndex;

        return GestureDetector(
          onTap: () => widget.onThumbnailTap(index),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 60,
            height: 60,
            margin: const EdgeInsets.only(right: 8),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: isSelected ? Colors.white : Colors.transparent,
                width: 2,
              ),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  _ThumbnailImage(
                    attachment: attachment,
                    isSelected: isSelected,
                  ),
                  // Video indicator
                  if (attachment.type == AttachmentType.video)
                    Center(
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.play_arrow,
                          color: Colors.white,
                          size: 16,
                        ),
                      ),
                    ),
                  // Dim overlay for non-selected
                  if (!isSelected)
                    Container(
                      color: Colors.black.withValues(alpha: 0.4),
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

/// Thumbnail image widget with signed URL
class _ThumbnailImage extends ConsumerWidget {
  final Attachment attachment;
  final bool isSelected;

  const _ThumbnailImage({
    required this.attachment,
    required this.isSelected,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final urlAsync = ref.watch(
      attachmentSignedUrlProvider(attachment.storagePath),
    );

    return urlAsync.when(
      data: (url) => CachedNetworkImage(
        imageUrl: url,
        fit: BoxFit.cover,
        memCacheWidth: 120, // Reduced size for thumbnails
        placeholder: (context, url) => Container(
          color: const Color(0xFF1A1A1A),
          child: const Center(
            child: SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: Colors.white38,
              ),
            ),
          ),
        ),
        errorWidget: (context, url, error) => Container(
          color: const Color(0xFF1A1A1A),
          child: const Icon(
            Icons.broken_image,
            color: Colors.white38,
            size: 20,
          ),
        ),
      ),
      loading: () => Container(
        color: const Color(0xFF1A1A1A),
        child: const Center(
          child: SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: Colors.white38,
            ),
          ),
        ),
      ),
      error: (error, stack) => Container(
        color: const Color(0xFF1A1A1A),
        child: const Icon(
          Icons.error_outline,
          color: Colors.white38,
          size: 20,
        ),
      ),
    );
  }
}
