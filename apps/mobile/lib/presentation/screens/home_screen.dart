import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drop_mobile/data/models/models.dart';
import 'package:drop_mobile/presentation/providers/notes_provider.dart';
import 'package:drop_mobile/presentation/providers/recording_provider.dart';
import 'package:drop_mobile/presentation/providers/share_intent_provider.dart';
import 'package:drop_mobile/presentation/widgets/note_card.dart';
import 'package:drop_mobile/presentation/widgets/note_composer_sheet.dart';
import 'package:drop_mobile/presentation/widgets/view_mode_selector.dart';
import 'package:drop_mobile/presentation/widgets/category_filter.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool _sharedContentHandled = false;

  @override
  void initState() {
    super.initState();
    // Check for shared content after the first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkForSharedContent();
    });
  }

  void _checkForSharedContent() {
    if (_sharedContentHandled) return;

    final sharedContent = ref.read(shareIntentProvider);
    debugPrint('[HomeScreen] Checking shared content: ${sharedContent.hasContent}');
    if (sharedContent.hasContent) {
      _sharedContentHandled = true;
      _openComposerWithSharedContent(sharedContent);
    }
    // Note: Don't set _sharedContentHandled = true here if no content
    // The async getInitialMedia might not have completed yet
  }

  Future<void> _openComposerWithSharedContent(SharedContent content) async {
    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E1E1E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => NoteComposerSheet(
        sharedMedia: content.mediaFiles.isNotEmpty ? content.mediaFiles : null,
        sharedText: content.text,
      ),
    );

    // Clear shared content after handling
    if (result == true) {
      ref.read(shareIntentProvider.notifier).clearSharedContent();
    }
  }

  @override
  Widget build(BuildContext context) {
    final notesAsync = ref.watch(notesProvider);
    final recordingState = ref.watch(recordingProvider);

    // Listen for new shared content
    ref.listen<SharedContent>(shareIntentProvider, (previous, next) {
      debugPrint('[HomeScreen] Share content changed: ${next.hasContent}, handled: $_sharedContentHandled');
      if (next.hasContent && !_sharedContentHandled) {
        _sharedContentHandled = true;
        _openComposerWithSharedContent(next);
      }
    });

    // Listen for recording errors
    ref.listen<RecordingState>(recordingProvider, (previous, next) {
      if (next.error != null && previous?.error != next.error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.error!),
            backgroundColor: Colors.red,
          ),
        );
      }
    });

    final viewMode = ref.watch(viewModeProvider);

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
        actions: [
          if (viewMode == NoteViewMode.trash)
            TextButton(
              onPressed: () => _showEmptyTrashDialog(context, ref),
              child: const Text(
                '비우기',
                style: TextStyle(color: Colors.red),
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          // View Mode Selector
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: ViewModeSelector(),
          ),
          // Category Filter (only in active mode)
          if (viewMode == NoteViewMode.active)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: CategoryFilter(),
            ),
          // Notes content
          Expanded(
            child: notesAsync.when(
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
                'An error occurred',
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
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
              data: (notes) => const _NoteFeed(),
            ),
          ),
        ],
      ),
      floatingActionButton: viewMode == NoteViewMode.active
          ? _ActionButtons(
              isRecording: recordingState.isRecording,
              onAddPressed: () => _openComposer(context),
              onRecordPressed: () => _startRecording(),
            )
          : null,
    );
  }

  Future<void> _showEmptyTrashDialog(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A2A),
        title: const Text(
          '휴지통 비우기',
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          '휴지통의 모든 노트가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.',
          style: TextStyle(color: Colors.grey),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text(
              '비우기',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await ref.read(notesProvider.notifier).emptyTrash();
    }
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

  void _startRecording() {
    HapticFeedback.mediumImpact();
    ref.read(recordingProvider.notifier).startRecording();
  }
}

class _NoteFeed extends ConsumerWidget {
  const _NoteFeed();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final viewMode = ref.watch(viewModeProvider);
    final grouped = ref.watch(filteredNotesGroupedByDateProvider);
    final sortedDates = grouped.keys.toList();

    if (sortedDates.isEmpty) {
      return _EmptyState(viewMode: viewMode);
    }

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
                    viewMode: viewMode,
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
  final bool isRecording;
  final VoidCallback onAddPressed;
  final VoidCallback onRecordPressed;

  const _ActionButtons({
    required this.isRecording,
    required this.onAddPressed,
    required this.onRecordPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Record button - hidden when recording (controls are in NoteCard)
        if (!isRecording)
          FloatingActionButton(
            heroTag: 'record',
            onPressed: onRecordPressed,
            backgroundColor: const Color(0xFF2A2A2A),
            child: const Icon(Icons.mic),
          ),
        if (!isRecording) const SizedBox(height: 12),
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

class _EmptyState extends StatelessWidget {
  final NoteViewMode viewMode;

  const _EmptyState({required this.viewMode});

  @override
  Widget build(BuildContext context) {
    final (icon, title, subtitle) = switch (viewMode) {
      NoteViewMode.active => (
          Icons.note_add_outlined,
          '노트가 없습니다',
          '+ 버튼을 눌러 첫 번째 노트를 만드세요',
        ),
      NoteViewMode.archived => (
          Icons.archive_outlined,
          '보관된 노트가 없습니다',
          '보관한 노트가 여기에 표시됩니다',
        ),
      NoteViewMode.trash => (
          Icons.delete_outline,
          '휴지통이 비어 있습니다',
          '삭제한 노트가 여기에 표시됩니다',
        ),
    };

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 64,
            color: Colors.grey[600],
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Colors.grey[400],
                ),
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
        ],
      ),
    );
  }
}
