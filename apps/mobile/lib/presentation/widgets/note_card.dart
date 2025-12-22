import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:throw_mobile/core/utils/time_utils.dart';
import 'package:throw_mobile/data/models/models.dart';
import 'package:throw_mobile/presentation/providers/notes_provider.dart';

class NoteCard extends ConsumerWidget {
  final Note note;
  final int depth;

  const NoteCard({
    super.key,
    required this.note,
    this.depth = 0,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: EdgeInsets.only(left: depth * 24.0),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A2A),
        borderRadius: BorderRadius.circular(8),
        border: depth > 0
            ? const Border(
                left: BorderSide(
                  color: Color(0xFF333333),
                  width: 2,
                ),
              )
            : null,
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
                      onTap: () async {
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
