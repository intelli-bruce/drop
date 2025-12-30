import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:receive_sharing_intent/receive_sharing_intent.dart';
import 'package:drop_mobile/data/models/models.dart';
import 'package:drop_mobile/data/repositories/attachments_repository.dart';
import 'package:drop_mobile/presentation/providers/notes_provider.dart';

class NoteComposerSheet extends ConsumerStatefulWidget {
  final Note? note;
  final String? parentId;
  final List<SharedMediaFile>? sharedMedia;
  final String? sharedText;

  const NoteComposerSheet({
    super.key,
    this.note,
    this.parentId,
    this.sharedMedia,
    this.sharedText,
  });

  @override
  ConsumerState<NoteComposerSheet> createState() => _NoteComposerSheetState();
}

class _NoteComposerSheetState extends ConsumerState<NoteComposerSheet> {
  late final TextEditingController _controller;
  bool _isSaving = false;
  List<SharedMediaFile> _pendingMedia = [];

  bool get _isEditing => widget.note != null;
  bool get _hasSharedContent =>
      widget.sharedMedia != null || widget.sharedText != null;

  @override
  void initState() {
    super.initState();
    // Initialize with shared text or existing note content
    String initialText = widget.note?.content ?? '';
    if (widget.sharedText != null && widget.sharedText!.isNotEmpty) {
      initialText = widget.sharedText!;
    }
    _controller = TextEditingController(text: initialText);

    // Initialize pending media
    if (widget.sharedMedia != null) {
      _pendingMedia = List.from(widget.sharedMedia!);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _removeMedia(int index) {
    setState(() {
      _pendingMedia.removeAt(index);
    });
  }

  Future<void> _save() async {
    if (_isSaving) return;

    final content = _controller.text.trimRight();
    final hasMedia = _pendingMedia.isNotEmpty;
    final canSave = _isEditing || content.trim().isNotEmpty || hasMedia;
    if (!canSave) return;

    setState(() => _isSaving = true);

    try {
      if (_isEditing) {
        await ref.read(notesProvider.notifier).updateNote(
              widget.note!.id,
              content,
            );
      } else {
        // Create note first
        final note = await ref.read(notesProvider.notifier).createNote(
              content: content,
              parentId: widget.parentId,
            );

        // Upload attachments
        final attachmentsRepo = ref.read(attachmentsRepositoryProvider);
        for (final media in _pendingMedia) {
          try {
            final file = File(media.path);
            if (!await file.exists()) continue;

            switch (media.type) {
              case SharedMediaType.image:
                final attachment = await attachmentsRepo.createImageAttachment(
                  noteId: note.id,
                  file: file,
                );
                ref.read(notesProvider.notifier).addAttachmentToNote(
                      note.id,
                      attachment,
                    );
                break;
              case SharedMediaType.video:
                final attachment = await attachmentsRepo.createFileAttachment(
                  noteId: note.id,
                  file: file,
                  type: 'video',
                );
                ref.read(notesProvider.notifier).addAttachmentToNote(
                      note.id,
                      attachment,
                    );
                break;
              case SharedMediaType.file:
                final attachment = await attachmentsRepo.createFileAttachment(
                  noteId: note.id,
                  file: file,
                  type: 'file',
                );
                ref.read(notesProvider.notifier).addAttachmentToNote(
                      note.id,
                      attachment,
                    );
                break;
              case SharedMediaType.text:
              case SharedMediaType.url:
                // Text and URL are handled as note content, not attachments
                break;
            }
          } catch (e) {
            debugPrint('Failed to upload attachment: $e');
          }
        }
      }

      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final content = _controller.text.trim();
    final hasMedia = _pendingMedia.isNotEmpty;
    final canSave = _isEditing || content.isNotEmpty || hasMedia;

    String title = 'New Note';
    if (_isEditing) {
      title = 'Edit Note';
    } else if (_hasSharedContent) {
      title = 'Save to DROP';
    }

    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: const Color(0xFF3A3A3A),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),

          // Media preview
          if (_pendingMedia.isNotEmpty) ...[
            SizedBox(
              height: 100,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _pendingMedia.length,
                itemBuilder: (context, index) {
                  final media = _pendingMedia[index];
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: _buildMediaPreview(media),
                        ),
                        Positioned(
                          top: 4,
                          right: 4,
                          child: GestureDetector(
                            onTap: () => _removeMedia(index),
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                color: Colors.black54,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.close,
                                size: 16,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 12),
          ],

          TextField(
            controller: _controller,
            maxLines: 8,
            minLines: 4,
            autofocus: true,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              hintText: 'Enter content',
              hintStyle: TextStyle(color: Color(0xFF666666)),
              filled: true,
              fillColor: Color(0xFF232323),
              border: OutlineInputBorder(
                borderSide: BorderSide.none,
                borderRadius: BorderRadius.all(Radius.circular(12)),
              ),
            ),
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: _isSaving ? null : () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: _isSaving || !canSave ? null : _save,
                child: Text(_isSaving ? 'Saving...' : 'Save'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMediaPreview(SharedMediaFile media) {
    switch (media.type) {
      case SharedMediaType.image:
        final file = File(media.path);
        if (file.existsSync()) {
          return Image.file(
            file,
            width: 100,
            height: 100,
            fit: BoxFit.cover,
          );
        }
        return _buildPlaceholder(Icons.image);
      case SharedMediaType.video:
        if (media.thumbnail != null) {
          final thumbFile = File(media.thumbnail!);
          if (thumbFile.existsSync()) {
            return Stack(
              alignment: Alignment.center,
              children: [
                Image.file(
                  thumbFile,
                  width: 100,
                  height: 100,
                  fit: BoxFit.cover,
                ),
                const Icon(
                  Icons.play_circle_outline,
                  color: Colors.white,
                  size: 32,
                ),
              ],
            );
          }
        }
        return _buildPlaceholder(Icons.videocam);
      case SharedMediaType.file:
        return _buildPlaceholder(Icons.insert_drive_file);
      case SharedMediaType.text:
        return _buildPlaceholder(Icons.text_fields);
      case SharedMediaType.url:
        return _buildPlaceholder(Icons.link);
    }
  }

  Widget _buildPlaceholder(IconData icon) {
    return Container(
      width: 100,
      height: 100,
      color: const Color(0xFF2A2A2A),
      child: Icon(
        icon,
        color: Colors.grey,
        size: 32,
      ),
    );
  }
}
