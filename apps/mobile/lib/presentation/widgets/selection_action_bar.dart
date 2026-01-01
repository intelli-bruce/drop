import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drop_mobile/data/models/models.dart';
import 'package:drop_mobile/presentation/providers/notes_provider.dart';
import 'package:drop_mobile/presentation/providers/selection_provider.dart';

class SelectionActionBar extends ConsumerWidget {
  const SelectionActionBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectionState = ref.watch(selectionProvider);
    final viewMode = ref.watch(viewModeProvider);

    if (!selectionState.isSelectionMode) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).padding.bottom + 8,
        top: 12,
        left: 16,
        right: 16,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF2A2A2A),
        border: Border(top: BorderSide(color: Color(0xFF333333))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: _buildActions(context, ref, viewMode, selectionState),
      ),
    );
  }

  List<Widget> _buildActions(
    BuildContext context,
    WidgetRef ref,
    NoteViewMode viewMode,
    SelectionState selectionState,
  ) {
    final selectedIds = selectionState.selectedIds;

    switch (viewMode) {
      case NoteViewMode.active:
        return [
          _ActionButton(
            icon: Icons.archive_outlined,
            label: '보관',
            onTap: () => _batchArchive(context, ref, selectedIds),
          ),
          _ActionButton(
            icon: Icons.delete_outline,
            label: '삭제',
            color: Colors.red,
            onTap: () => _batchDelete(context, ref, selectedIds),
          ),
        ];
      case NoteViewMode.archived:
        return [
          _ActionButton(
            icon: Icons.unarchive_outlined,
            label: '해제',
            onTap: () => _batchUnarchive(context, ref, selectedIds),
          ),
          _ActionButton(
            icon: Icons.delete_outline,
            label: '삭제',
            color: Colors.red,
            onTap: () => _batchDelete(context, ref, selectedIds),
          ),
        ];
      case NoteViewMode.trash:
        return [
          _ActionButton(
            icon: Icons.restore,
            label: '복원',
            onTap: () => _batchRestore(context, ref, selectedIds),
          ),
          _ActionButton(
            icon: Icons.delete_forever,
            label: '영구삭제',
            color: Colors.red,
            onTap: () => _showBatchPermanentDeleteConfirmation(context, ref, selectedIds),
          ),
        ];
    }
  }

  void _batchArchive(BuildContext context, WidgetRef ref, Set<String> selectedIds) {
    HapticFeedback.mediumImpact();
    final count = selectedIds.length;

    for (final id in selectedIds) {
      ref.read(notesProvider.notifier).archiveNote(id);
    }

    ref.read(selectionProvider.notifier).exitSelectionMode();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$count개의 노트가 보관되었습니다'),
        action: SnackBarAction(
          label: '취소',
          onPressed: () {
            for (final id in selectedIds) {
              ref.read(notesProvider.notifier).unarchiveNote(id);
            }
          },
        ),
      ),
    );
  }

  void _batchUnarchive(BuildContext context, WidgetRef ref, Set<String> selectedIds) {
    HapticFeedback.mediumImpact();
    final count = selectedIds.length;

    for (final id in selectedIds) {
      ref.read(notesProvider.notifier).unarchiveNote(id);
    }

    ref.read(selectionProvider.notifier).exitSelectionMode();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$count개의 노트가 보관 해제되었습니다')),
    );
  }

  void _batchDelete(BuildContext context, WidgetRef ref, Set<String> selectedIds) {
    HapticFeedback.mediumImpact();
    final count = selectedIds.length;

    for (final id in selectedIds) {
      ref.read(notesProvider.notifier).deleteNote(id);
    }

    ref.read(selectionProvider.notifier).exitSelectionMode();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$count개의 노트가 휴지통으로 이동되었습니다'),
        action: SnackBarAction(
          label: '취소',
          onPressed: () {
            for (final id in selectedIds) {
              ref.read(notesProvider.notifier).restoreNote(id);
            }
          },
        ),
      ),
    );
  }

  void _batchRestore(BuildContext context, WidgetRef ref, Set<String> selectedIds) {
    HapticFeedback.mediumImpact();
    final count = selectedIds.length;

    for (final id in selectedIds) {
      ref.read(notesProvider.notifier).restoreNote(id);
    }

    ref.read(selectionProvider.notifier).exitSelectionMode();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$count개의 노트가 복원되었습니다')),
    );
  }

  void _showBatchPermanentDeleteConfirmation(
    BuildContext context,
    WidgetRef ref,
    Set<String> selectedIds,
  ) {
    final count = selectedIds.length;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A2A),
        title: const Text('영구 삭제', style: TextStyle(color: Colors.white)),
        content: Text(
          '$count개의 노트를 영구적으로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
          style: const TextStyle(color: Color(0xFFE0E0E0)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              HapticFeedback.mediumImpact();

              for (final id in selectedIds) {
                ref.read(notesProvider.notifier).permanentlyDeleteNote(id);
              }

              ref.read(selectionProvider.notifier).exitSelectionMode();

              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('$count개의 노트가 영구 삭제되었습니다')),
              );
            },
            child: const Text('영구 삭제', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final buttonColor = color ?? const Color(0xFF4A9EFF);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: buttonColor, size: 24),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: buttonColor,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
