import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drop_mobile/data/models/models.dart';
import 'package:drop_mobile/presentation/providers/notes_provider.dart';

class ViewModeSelector extends ConsumerWidget {
  const ViewModeSelector({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentMode = ref.watch(viewModeProvider);
    final trashCount = ref.watch(trashCountProvider);
    final archivedCount = ref.watch(archivedCountProvider);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A2A),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _ViewModeButton(
            icon: Icons.note_outlined,
            label: '노트',
            isSelected: currentMode == NoteViewMode.active,
            onTap: () => ref
                .read(viewModeProvider.notifier)
                .setViewMode(NoteViewMode.active),
          ),
          _ViewModeButton(
            icon: Icons.archive_outlined,
            label: '보관함',
            badge: archivedCount > 0 ? archivedCount : null,
            isSelected: currentMode == NoteViewMode.archived,
            onTap: () => ref
                .read(viewModeProvider.notifier)
                .setViewMode(NoteViewMode.archived),
          ),
          _ViewModeButton(
            icon: Icons.delete_outline,
            label: '휴지통',
            badge: trashCount > 0 ? trashCount : null,
            isSelected: currentMode == NoteViewMode.trash,
            onTap: () => ref
                .read(viewModeProvider.notifier)
                .setViewMode(NoteViewMode.trash),
          ),
        ],
      ),
    );
  }
}

class _ViewModeButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final int? badge;
  final bool isSelected;
  final VoidCallback onTap;

  const _ViewModeButton({
    required this.icon,
    required this.label,
    this.badge,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF4A9EFF) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 18,
              color: isSelected ? Colors.white : Colors.grey[400],
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                color: isSelected ? Colors.white : Colors.grey[400],
              ),
            ),
            if (badge != null) ...[
              const SizedBox(width: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isSelected
                      ? Colors.white.withValues(alpha: 0.2)
                      : Colors.grey[700],
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  badge.toString(),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isSelected ? Colors.white : Colors.grey[400],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
