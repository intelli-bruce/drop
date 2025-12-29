import 'dart:async';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drop_mobile/core/utils/time_utils.dart';
import 'package:drop_mobile/data/models/models.dart';
import 'package:drop_mobile/data/repositories/attachments_repository.dart';
import 'package:drop_mobile/presentation/providers/notes_provider.dart';

class NoteCard extends ConsumerWidget {
  final Note note;
  final int depth;
  final VoidCallback? onEdit;
  final VoidCallback? onReply;

  const NoteCard({
    super.key,
    required this.note,
    this.depth = 0,
    this.onEdit,
    this.onReply,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cardContent = Container(
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A2A),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Color(0xFF333333)),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  formatRelativeTime(note.createdAt),
                  style: const TextStyle(
                    color: Color(0xFF888888),
                    fontSize: 12,
                  ),
                ),
                Row(
                  children: [
                    // Reply button
                    GestureDetector(
                      onTap: onReply ??
                          () async {
                            await ref
                                .read(notesProvider.notifier)
                                .createNote(parentId: note.id);
                          },
                      child: const Padding(
                        padding: EdgeInsets.all(4),
                        child: Icon(
                          Icons.reply,
                          color: Color(0xFF888888),
                          size: 18,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Delete button
                    GestureDetector(
                      onTap: () => _showDeleteConfirmation(context, ref),
                      child: const Padding(
                        padding: EdgeInsets.all(4),
                        child: Icon(
                          Icons.close,
                          color: Color(0xFF888888),
                          size: 18,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(12),
            child: Text(
              note.content.isEmpty ? '(빈 노트)' : note.content,
              style: TextStyle(
                color: note.content.isEmpty
                    ? const Color(0xFF666666)
                    : const Color(0xFFE0E0E0),
                fontSize: 15,
                height: 1.6,
                fontStyle:
                    note.content.isEmpty ? FontStyle.italic : FontStyle.normal,
              ),
            ),
          ),
          // Attachments
          if (note.attachments.isNotEmpty) _buildAttachments(),
          // Tags
          if (note.tags.isNotEmpty) _buildTags(),
        ],
      ),
    );

    return GestureDetector(
      onTap: onEdit,
      child: Padding(
        padding: EdgeInsets.only(left: depth * 24.0),
        child: depth > 0
            ? IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Container(
                      width: 2,
                      margin: const EdgeInsets.only(right: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF444444),
                        borderRadius: BorderRadius.circular(1),
                      ),
                    ),
                    Expanded(child: cardContent),
                  ],
                ),
              )
            : cardContent,
      ),
    );
  }

  Widget _buildAttachments() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: const BoxDecoration(
        border: Border(
          top: BorderSide(color: Color(0xFF333333)),
        ),
      ),
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: note.attachments.map((attachment) {
          if (attachment.type == AttachmentType.audio) {
            return _AudioAttachmentChip(attachment: attachment);
          }
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF242424),
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: const Color(0xFF333333)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  _getAttachmentIcon(attachment.type),
                  color: const Color(0xFF888888),
                  size: 14,
                ),
                const SizedBox(width: 4),
                Text(
                  attachment.filename ?? attachment.type.name,
                  style: const TextStyle(
                    color: Color(0xFF888888),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildTags() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: const BoxDecoration(
        border: Border(
          top: BorderSide(color: Color(0xFF333333)),
        ),
      ),
      child: Wrap(
        spacing: 6,
        runSpacing: 6,
        children: note.tags.map((tag) {
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: const Color(0xFF242424),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF333333)),
            ),
            child: Text(
              '#${tag.name}',
              style: const TextStyle(
                color: Color(0xFF4A9EFF),
                fontSize: 12,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  IconData _getAttachmentIcon(AttachmentType type) {
    switch (type) {
      case AttachmentType.image:
        return Icons.image;
      case AttachmentType.video:
        return Icons.videocam;
      case AttachmentType.audio:
        return Icons.audiotrack;
      case AttachmentType.file:
        return Icons.attach_file;
      case AttachmentType.text:
        return Icons.text_snippet;
      case AttachmentType.instagram:
        return Icons.camera_alt;
    }
  }

  void _showDeleteConfirmation(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A2A),
        title: const Text(
          '노트 삭제',
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          '이 노트를 삭제하시겠습니까?',
          style: TextStyle(color: Color(0xFFE0E0E0)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(notesProvider.notifier).deleteNote(note.id);
            },
            child: const Text(
              '삭제',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}

class _AudioAttachmentChip extends ConsumerStatefulWidget {
  final Attachment attachment;

  const _AudioAttachmentChip({
    required this.attachment,
  });

  @override
  ConsumerState<_AudioAttachmentChip> createState() =>
      _AudioAttachmentChipState();
}

class _AudioAttachmentChipState extends ConsumerState<_AudioAttachmentChip> {
  final AudioPlayer _player = AudioPlayer();
  StreamSubscription<void>? _completionSubscription;
  bool _isPlaying = false;

  @override
  void initState() {
    super.initState();
    _completionSubscription = _player.onPlayerComplete.listen((_) {
      if (mounted) {
        setState(() => _isPlaying = false);
      }
    });
  }

  @override
  void dispose() {
    _completionSubscription?.cancel();
    _player.dispose();
    super.dispose();
  }

  Future<void> _togglePlay(String url) async {
    if (_isPlaying) {
      await _player.stop();
      if (mounted) setState(() => _isPlaying = false);
      return;
    }

    await _player.play(UrlSource(url));
    if (mounted) setState(() => _isPlaying = true);
  }

  @override
  Widget build(BuildContext context) {
    final urlAsync = ref.watch(
      attachmentSignedUrlProvider(widget.attachment.storagePath),
    );

    return urlAsync.when(
      data: (url) => GestureDetector(
        onTap: () => _togglePlay(url),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFF242424),
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: const Color(0xFF333333)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                _isPlaying ? Icons.pause : Icons.play_arrow,
                color: const Color(0xFF888888),
                size: 16,
              ),
              const SizedBox(width: 4),
              Text(
                widget.attachment.filename ?? 'audio',
                style: const TextStyle(
                  color: Color(0xFF888888),
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
      loading: () => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: const Color(0xFF242424),
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: const Color(0xFF333333)),
        ),
        child: const SizedBox(
          width: 16,
          height: 16,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
      ),
      error: (error, stack) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: const Color(0xFF242424),
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: const Color(0xFF333333)),
        ),
        child: const Icon(
          Icons.error_outline,
          color: Color(0xFF888888),
          size: 16,
        ),
      ),
    );
  }
}
