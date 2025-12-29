import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drop_mobile/data/models/models.dart';
import 'package:drop_mobile/presentation/providers/notes_provider.dart';
import 'package:drop_mobile/presentation/widgets/note_card.dart';
import 'package:drop_mobile/presentation/widgets/note_composer_sheet.dart';
import 'package:drop_mobile/presentation/widgets/recording_sheet.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notesAsync = ref.watch(notesProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF1A1A1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1A1A),
        elevation: 0,
        title: const Text(
          'DROP',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: notesAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(),
        ),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 48),
              const SizedBox(height: 16),
              Text(
                '오류가 발생했습니다',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.white,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                error.toString(),
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(notesProvider),
                child: const Text('다시 시도'),
              ),
            ],
          ),
        ),
        data: (notes) {
          if (notes.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.note_add_outlined,
                    size: 64,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '노트가 없습니다',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Colors.grey[400],
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '+ 버튼을 눌러 첫 노트를 작성하세요',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                ],
              ),
            );
          }

          return const _NoteFeed();
        },
      ),
      floatingActionButton: _ActionButtons(
        onAddPressed: () => _openComposer(context),
        onRecordPressed: () => _openRecorder(context),
      ),
    );
  }

  Future<void> _openComposer(BuildContext context, {String? parentId}) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E1E1E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => NoteComposerSheet(parentId: parentId),
    );
  }

  Future<void> _openRecorder(BuildContext context) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E1E1E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => const RecordingSheet(),
    );
  }
}

class _NoteFeed extends ConsumerWidget {
  const _NoteFeed();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final grouped = ref.watch(notesGroupedByDateProvider);
    final sortedDates = grouped.keys.toList();

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: sortedDates.length,
      itemBuilder: (context, index) {
        final date = sortedDates[index];
        final dateNotes = grouped[date]!;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.only(bottom: 12, top: index > 0 ? 24 : 0),
              child: Text(
                date,
                style: const TextStyle(
                  color: Color(0xFF888888),
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            ...dateNotes.map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: NoteCard(
                    note: item.note,
                    depth: item.depth,
                    onEdit: () => _openEditComposer(context, item.note),
                    onReply: () => _openReplyComposer(context, item.note.id),
                  ),
                )),
          ],
        );
      },
    );
  }

  Future<void> _openEditComposer(
    BuildContext context,
    Note note,
  ) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E1E1E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => NoteComposerSheet(note: note),
    );
  }

  Future<void> _openReplyComposer(
    BuildContext context,
    String parentId,
  ) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E1E1E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => NoteComposerSheet(parentId: parentId),
    );
  }
}

class _ActionButtons extends StatelessWidget {
  final VoidCallback onAddPressed;
  final VoidCallback onRecordPressed;

  const _ActionButtons({
    required this.onAddPressed,
    required this.onRecordPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        FloatingActionButton(
          heroTag: 'record',
          mini: true,
          onPressed: onRecordPressed,
          backgroundColor: const Color(0xFF2A2A2A),
          child: const Icon(Icons.mic),
        ),
        const SizedBox(height: 12),
        FloatingActionButton(
          heroTag: 'add',
          onPressed: onAddPressed,
          backgroundColor: const Color(0xFF4A9EFF),
          child: const Icon(Icons.add),
        ),
      ],
    );
  }
}
