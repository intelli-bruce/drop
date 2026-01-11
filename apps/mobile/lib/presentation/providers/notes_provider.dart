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
      onUpdate: (updatedNote) {
        final current = state.value ?? [];
        state = AsyncData(
          current.map((n) {
            if (n.id == updatedNote.id) {
              // Preserve attachments and tags from current state
              return updatedNote.copyWith(
                attachments: n.attachments,
                tags: n.tags,
              );
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
      displayId: 0, // Temporary placeholder, will be replaced by server response
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

  /// Delete a note (move to trash)
  Future<void> deleteNote(String id) async {
    final repository = ref.read(notesRepositoryProvider);

    // Optimistic update
    final current = state.value ?? [];
    final noteIndex = current.indexWhere((n) => n.id == id);
    if (noteIndex == -1) return;

    final oldNote = current[noteIndex];
    final updatedNote = oldNote.copyWith(
      isDeleted: true,
      deletedAt: DateTime.now(),
      archivedAt: null,
    );

    state = AsyncData(
      current.map((n) => n.id == id ? updatedNote : n).toList(),
    );

    try {
      await repository.deleteNote(id);
    } catch (e) {
      // Rollback on error
      state = AsyncData(
        (state.value ?? []).map((n) => n.id == id ? oldNote : n).toList(),
      );
      rethrow;
    }
  }

  /// Archive a note
  Future<void> archiveNote(String id) async {
    final repository = ref.read(notesRepositoryProvider);

    final current = state.value ?? [];
    final noteIndex = current.indexWhere((n) => n.id == id);
    if (noteIndex == -1) return;

    final oldNote = current[noteIndex];
    final updatedNote = oldNote.copyWith(
      archivedAt: DateTime.now(),
    );

    state = AsyncData(
      current.map((n) => n.id == id ? updatedNote : n).toList(),
    );

    try {
      await repository.archiveNote(id);
    } catch (e) {
      state = AsyncData(
        (state.value ?? []).map((n) => n.id == id ? oldNote : n).toList(),
      );
      rethrow;
    }
  }

  /// Unarchive a note (move back to active)
  Future<void> unarchiveNote(String id) async {
    final repository = ref.read(notesRepositoryProvider);

    final current = state.value ?? [];
    final noteIndex = current.indexWhere((n) => n.id == id);
    if (noteIndex == -1) return;

    final oldNote = current[noteIndex];
    final updatedNote = oldNote.copyWith(archivedAt: null);

    state = AsyncData(
      current.map((n) => n.id == id ? updatedNote : n).toList(),
    );

    try {
      await repository.unarchiveNote(id);
    } catch (e) {
      state = AsyncData(
        (state.value ?? []).map((n) => n.id == id ? oldNote : n).toList(),
      );
      rethrow;
    }
  }

  /// Restore a note from trash
  Future<void> restoreNote(String id) async {
    final repository = ref.read(notesRepositoryProvider);

    final current = state.value ?? [];
    final noteIndex = current.indexWhere((n) => n.id == id);
    if (noteIndex == -1) return;

    final oldNote = current[noteIndex];
    final updatedNote = oldNote.copyWith(
      isDeleted: false,
      deletedAt: null,
    );

    state = AsyncData(
      current.map((n) => n.id == id ? updatedNote : n).toList(),
    );

    try {
      await repository.restoreNote(id);
    } catch (e) {
      state = AsyncData(
        (state.value ?? []).map((n) => n.id == id ? oldNote : n).toList(),
      );
      rethrow;
    }
  }

  /// Permanently delete a note
  Future<void> permanentlyDeleteNote(String id) async {
    final repository = ref.read(notesRepositoryProvider);

    final current = state.value ?? [];
    final deletedNote = current.firstWhere((n) => n.id == id);
    state = AsyncData(current.where((n) => n.id != id).toList());

    try {
      await repository.permanentlyDeleteNote(id);
    } catch (e) {
      state = AsyncData([deletedNote, ...(state.value ?? [])]);
      rethrow;
    }
  }

  /// Empty trash (permanently delete all trashed notes)
  Future<void> emptyTrash() async {
    final repository = ref.read(notesRepositoryProvider);

    final current = state.value ?? [];
    final trashedNotes = current.where((n) => n.isInTrash).toList();
    state = AsyncData(current.where((n) => !n.isInTrash).toList());

    try {
      await repository.emptyTrash();
    } catch (e) {
      state = AsyncData([...trashedNotes, ...(state.value ?? [])]);
      rethrow;
    }
  }

  /// Lock/unlock a note
  Future<void> setNoteLocked(String id, bool isLocked) async {
    final repository = ref.read(notesRepositoryProvider);

    final current = state.value ?? [];
    final noteIndex = current.indexWhere((n) => n.id == id);
    if (noteIndex == -1) return;

    final oldNote = current[noteIndex];
    final updatedNote = oldNote.copyWith(isLocked: isLocked);

    state = AsyncData(
      current.map((n) => n.id == id ? updatedNote : n).toList(),
    );

    try {
      await repository.setNoteLocked(id, isLocked);
    } catch (e) {
      state = AsyncData(
        (state.value ?? []).map((n) => n.id == id ? oldNote : n).toList(),
      );
      rethrow;
    }
  }

  /// Toggle pin status of a note
  Future<void> togglePinNote(String id) async {
    final repository = ref.read(notesRepositoryProvider);

    final current = state.value ?? [];
    final noteIndex = current.indexWhere((n) => n.id == id);
    if (noteIndex == -1) return;

    final oldNote = current[noteIndex];
    final newIsPinned = !oldNote.isPinned;
    final updatedNote = oldNote.copyWith(
      isPinned: newIsPinned,
      pinnedAt: newIsPinned ? DateTime.now() : null,
    );

    // Update and re-sort
    final updated = current.map((n) => n.id == id ? updatedNote : n).toList();
    _sortNotes(updated);
    state = AsyncData(updated);

    try {
      await repository.togglePinNote(id, isPinned: newIsPinned);
    } catch (e) {
      state = AsyncData(
        (state.value ?? []).map((n) => n.id == id ? oldNote : n).toList(),
      );
      rethrow;
    }
  }

  /// Cycle priority (0 -> 1 -> 2 -> 3 -> 0)
  Future<void> cyclePriority(String id) async {
    final repository = ref.read(notesRepositoryProvider);

    final current = state.value ?? [];
    final noteIndex = current.indexWhere((n) => n.id == id);
    if (noteIndex == -1) return;

    final oldNote = current[noteIndex];
    final newPriority = (oldNote.priority + 1) % 4;
    final updatedNote = oldNote.copyWith(priority: newPriority);

    state = AsyncData(
      current.map((n) => n.id == id ? updatedNote : n).toList(),
    );

    try {
      await repository.updatePriority(id, newPriority);
    } catch (e) {
      state = AsyncData(
        (state.value ?? []).map((n) => n.id == id ? oldNote : n).toList(),
      );
      rethrow;
    }
  }

  /// Update note priority directly
  Future<void> updatePriority(String id, int priority) async {
    final repository = ref.read(notesRepositoryProvider);

    final current = state.value ?? [];
    final noteIndex = current.indexWhere((n) => n.id == id);
    if (noteIndex == -1) return;

    final oldNote = current[noteIndex];
    final updatedNote = oldNote.copyWith(priority: priority.clamp(0, 3));

    state = AsyncData(
      current.map((n) => n.id == id ? updatedNote : n).toList(),
    );

    try {
      await repository.updatePriority(id, priority);
    } catch (e) {
      state = AsyncData(
        (state.value ?? []).map((n) => n.id == id ? oldNote : n).toList(),
      );
      rethrow;
    }
  }

  /// Sort notes by pinned status, then pinned_at, then created_at
  void _sortNotes(List<Note> notes) {
    notes.sort((a, b) {
      // Pinned notes first
      if (a.isPinned != b.isPinned) return a.isPinned ? -1 : 1;
      // Among pinned, sort by pinned_at DESC
      if (a.isPinned && b.isPinned) {
        final aPinnedAt = a.pinnedAt ?? DateTime(1970);
        final bPinnedAt = b.pinnedAt ?? DateTime(1970);
        return bPinnedAt.compareTo(aPinnedAt);
      }
      // Among non-pinned, sort by created_at DESC
      return b.createdAt.compareTo(a.createdAt);
    });
  }

  /// Update note categories based on content and attachments
  Future<void> updateNoteCategories(String id) async {
    final repository = ref.read(notesRepositoryProvider);

    final current = state.value ?? [];
    final noteIndex = current.indexWhere((n) => n.id == id);
    if (noteIndex == -1) return;

    final note = current[noteIndex];

    // Calculate category flags
    final hasLink = _hasUrl(note.content) ||
        note.attachments.any((a) => a.isLink);
    final hasMedia = note.attachments.any((a) => a.isMedia);
    final hasFiles = note.attachments.any((a) => a.isFile);

    final updatedNote = note.copyWith(
      hasLink: hasLink,
      hasMedia: hasMedia,
      hasFiles: hasFiles,
    );

    state = AsyncData(
      current.map((n) => n.id == id ? updatedNote : n).toList(),
    );

    try {
      await repository.updateNoteCategories(
        id,
        hasLink: hasLink,
        hasMedia: hasMedia,
        hasFiles: hasFiles,
      );
    } catch (e) {
      state = AsyncData(
        (state.value ?? []).map((n) => n.id == id ? note : n).toList(),
      );
      rethrow;
    }
  }

  /// Check if content contains a URL
  bool _hasUrl(String content) {
    final urlPattern = RegExp(r'https?://[^\s<>"{}|\\^`\[\]]+');
    return urlPattern.hasMatch(content);
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

/// Current view mode state
@riverpod
class ViewModeNotifier extends _$ViewModeNotifier {
  @override
  NoteViewMode build() => NoteViewMode.active;

  void setViewMode(NoteViewMode mode) {
    state = mode;
  }
}

/// Current category filter state
@riverpod
class CategoryFilterNotifier extends _$CategoryFilterNotifier {
  @override
  NoteCategory build() => NoteCategory.all;

  void setCategory(NoteCategory category) {
    state = category;
  }
}

/// Provides filtered notes based on view mode and category
@riverpod
List<Note> filteredNotes(Ref ref) {
  final notes = ref.watch(notesProvider).value ?? [];
  final viewMode = ref.watch(viewModeProvider);
  final category = ref.watch(categoryFilterProvider);

  return notes
      .where((n) => n.matchesViewMode(viewMode))
      .where((n) => n.matchesCategory(category))
      .toList();
}

/// Provides filtered notes grouped by date with thread depth
@riverpod
Map<String, List<NoteListItem>> filteredNotesGroupedByDate(Ref ref) {
  final notes = ref.watch(filteredNotesProvider);
  final flattened = _flattenNotes(notes);
  final grouped = <String, List<NoteListItem>>{};

  for (final item in flattened) {
    final dateKey = _formatDateKey(item.note.createdAt);
    grouped.putIfAbsent(dateKey, () => []).add(item);
  }

  return grouped;
}

/// Count of notes in trash
@riverpod
int trashCount(Ref ref) {
  final notes = ref.watch(notesProvider).value ?? [];
  return notes.where((n) => n.isInTrash).length;
}

/// Count of archived notes
@riverpod
int archivedCount(Ref ref) {
  final notes = ref.watch(notesProvider).value ?? [];
  return notes.where((n) => n.isArchived).length;
}

/// Session-based unlocked notes (cleared when app restarts)
@riverpod
class UnlockedNotesNotifier extends _$UnlockedNotesNotifier {
  @override
  Set<String> build() => {};

  void unlock(String noteId) {
    state = {...state, noteId};
  }

  void lock(String noteId) {
    state = {...state}..remove(noteId);
  }

  void lockAll() {
    state = {};
  }

  bool isUnlocked(String noteId) => state.contains(noteId);
}
