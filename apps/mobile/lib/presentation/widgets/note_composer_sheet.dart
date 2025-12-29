import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drop_mobile/data/models/models.dart';
import 'package:drop_mobile/presentation/providers/notes_provider.dart';

class NoteComposerSheet extends ConsumerStatefulWidget {
  final Note? note;
  final String? parentId;

  const NoteComposerSheet({
    super.key,
    this.note,
    this.parentId,
  });

  @override
  ConsumerState<NoteComposerSheet> createState() => _NoteComposerSheetState();
}

class _NoteComposerSheetState extends ConsumerState<NoteComposerSheet> {
  late final TextEditingController _controller;
  bool _isSaving = false;

  bool get _isEditing => widget.note != null;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.note?.content ?? '');
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_isSaving) return;

    final content = _controller.text.trimRight();
    final canSave = _isEditing || content.trim().isNotEmpty;
    if (!canSave) return;

    setState(() => _isSaving = true);

    try {
      if (_isEditing) {
        await ref.read(notesProvider.notifier).updateNote(
              widget.note!.id,
              content,
            );
      } else {
        await ref.read(notesProvider.notifier).createNote(
              content: content,
              parentId: widget.parentId,
            );
      }

      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('저장에 실패했습니다: $e')),
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
    final canSave = _isEditing || content.isNotEmpty;

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
            _isEditing ? '노트 편집' : '새 노트',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _controller,
            maxLines: 8,
            minLines: 4,
            autofocus: true,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              hintText: '내용을 입력하세요',
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
                child: const Text('취소'),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: _isSaving || !canSave ? null : _save,
                child: Text(_isSaving ? '저장 중...' : '저장'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
