import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drop_mobile/data/models/models.dart';
import 'package:drop_mobile/presentation/providers/notes_provider.dart';

class CategoryFilter extends ConsumerWidget {
  const CategoryFilter({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentCategory = ref.watch(categoryFilterProvider);

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _CategoryChip(
            label: '전체',
            icon: Icons.grid_view_rounded,
            isSelected: currentCategory == NoteCategory.all,
            onTap: () => ref
                .read(categoryFilterProvider.notifier)
                .setCategory(NoteCategory.all),
          ),
          const SizedBox(width: 8),
          _CategoryChip(
            label: '링크',
            icon: Icons.link,
            isSelected: currentCategory == NoteCategory.links,
            onTap: () => ref
                .read(categoryFilterProvider.notifier)
                .setCategory(NoteCategory.links),
          ),
          const SizedBox(width: 8),
          _CategoryChip(
            label: '미디어',
            icon: Icons.image_outlined,
            isSelected: currentCategory == NoteCategory.media,
            onTap: () => ref
                .read(categoryFilterProvider.notifier)
                .setCategory(NoteCategory.media),
          ),
          const SizedBox(width: 8),
          _CategoryChip(
            label: '파일',
            icon: Icons.attach_file,
            isSelected: currentCategory == NoteCategory.files,
            onTap: () => ref
                .read(categoryFilterProvider.notifier)
                .setCategory(NoteCategory.files),
          ),
        ],
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryChip({
    required this.label,
    required this.icon,
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
          color: isSelected ? const Color(0xFF4A9EFF) : const Color(0xFF2A2A2A),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF4A9EFF) : Colors.transparent,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 16,
              color: isSelected ? Colors.white : Colors.grey[400],
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                color: isSelected ? Colors.white : Colors.grey[400],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
