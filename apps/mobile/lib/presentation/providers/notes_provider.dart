import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:drop_mobile/data/models/models.dart';
import 'package:drop_mobile/data/repositories/notes_repository.dart';

part 'notes_provider.g.dart';

@riverpod
class NotesNotifier extends _$NotesNotifier {
  RealtimeChannel? _subscription;

  @override
  Future<List<Note>> build() async {
    // Clean up subscription when provider is disposed
    ref.onDispose(() {
      _subscription?.unsubscribe();
    });

    // Load notes
    final repository = ref.watch(notesRepositoryProvider);
    final notes = await repository.loadNotes();

    // Subscribe to realtime changes
    _subscribeToChanges();

    return notes;
  }

  void _subscribeToChanges() {
    final repository = ref.read(notesRepositoryProvider);
    _subscription = repository.subscribeToChanges(
      onInsert: (note) {
        // Skip if already exists (optimistic update)
        final current = state.value ?? [];
        if (current.any((n) => n.id == note.id)) return;
        state = AsyncData([note, ...current]);
      },
      onUpdate: (id, content, updatedAt) {
        final current = state.value ?? [];
        state = AsyncData(
          current.map((n) {
            if (n.id == id) {
              return n.copyWith(content: content, updatedAt: updatedAt);
            }
            return n;
          }).toList(),
        );
      },
      onDelete: (id) {
        final current = state.value ?? [];
        state = AsyncData(current.where((n) => n.id != id).toList());
      },
    );
  }

  /// Create a new note
  Future<Note> createNote({String content = '', String? parentId}) async {
    final repository = ref.read(notesRepositoryProvider);

    // Optimistic update
    final optimisticNote = Note(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      content: content,
      parentId: parentId,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      source: NoteSource.mobile,
    );

    final current = state.value ?? [];
    state = AsyncData([optimisticNote, ...current]);

    try {
      final note = await repository.createNote(
        content: content,
        parentId: parentId,
      );

      // Replace optimistic note with real one
      state = AsyncData(
        (state.value ?? [])
            .map((n) => n.id == optimisticNote.id ? note : n)
            .toList(),
      );

      return note;
    } catch (e) {
      // Rollback on error
      state = AsyncData(
        (state.value ?? []).where((n) => n.id != optimisticNote.id).toList(),
      );
      rethrow;
    }
  }

  /// Update note content
  Future<void> updateNote(String id, String content) async {
    final repository = ref.read(notesRepositoryProvider);

    // Optimistic update
    final current = state.value ?? [];
    final oldNote = current.firstWhere((n) => n.id == id);
    state = AsyncData(
      current.map((n) {
        if (n.id == id) {
          return n.copyWith(content: content, updatedAt: DateTime.now());
        }
        return n;
      }).toList(),
    );

    try {
      await repository.updateNote(id, content);
    } catch (e) {
      // Rollback on error
      state = AsyncData(
        (state.value ?? []).map((n) => n.id == id ? oldNote : n).toList(),
      );
      rethrow;
    }
  }

  /// Attach a new attachment to a note in state
  void addAttachmentToNote(String noteId, Attachment attachment) {
    final current = state.value ?? [];
    if (current.isEmpty) return;

    state = AsyncData(
      current.map((n) {
        if (n.id == noteId) {
          return n.copyWith(attachments: [...n.attachments, attachment]);
        }
        return n;
      }).toList(),
    );
  }

  /// Delete a note
  Future<void> deleteNote(String id) async {
    final repository = ref.read(notesRepositoryProvider);

    // Optimistic update
    final current = state.value ?? [];
    final deletedNote = current.firstWhere((n) => n.id == id);
    state = AsyncData(current.where((n) => n.id != id).toList());

    try {
      await repository.deleteNote(id);
    } catch (e) {
      // Rollback on error
      state = AsyncData([deletedNote, ...(state.value ?? [])]);
      rethrow;
    }
  }
}

class NoteListItem {
  final Note note;
  final int depth;

  const NoteListItem({
    required this.note,
    required this.depth,
  });
}

/// Provides notes grouped by date with thread depth
@riverpod
Map<String, List<NoteListItem>> notesGroupedByDate(Ref ref) {
  final notes = ref.watch(notesProvider).value ?? [];
  final flattened = _flattenNotes(notes);
  final grouped = <String, List<NoteListItem>>{};

  for (final item in flattened) {
    final dateKey = _formatDateKey(item.note.createdAt);
    grouped.putIfAbsent(dateKey, () => []).add(item);
  }

  return grouped;
}

List<NoteListItem> _flattenNotes(List<Note> notes) {
  final roots = notes.where((n) => n.parentId == null).toList()
    ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

  final childrenMap = <String, List<Note>>{};
  for (final note in notes) {
    final parentId = note.parentId;
    if (parentId == null) continue;
    childrenMap.putIfAbsent(parentId, () => []).add(note);
  }

  for (final children in childrenMap.values) {
    children.sort((a, b) => a.createdAt.compareTo(b.createdAt));
  }

  final result = <NoteListItem>[];

  void walk(Note note, int depth) {
    result.add(NoteListItem(note: note, depth: depth));
    final children = childrenMap[note.id];
    if (children == null) return;
    for (final child in children) {
      walk(child, depth + 1);
    }
  }

  for (final root in roots) {
    walk(root, 0);
  }

  return result;
}

String _formatDateKey(DateTime date) {
  final now = DateTime.now();
  final today = DateTime(now.year, now.month, now.day);
  final noteDate = DateTime(date.year, date.month, date.day);

  if (noteDate == today) {
    return '오늘';
  }

  final yesterday = today.subtract(const Duration(days: 1));
  if (noteDate == yesterday) {
    return '어제';
  }

  return '${date.year}년 ${date.month}월 ${date.day}일';
}
