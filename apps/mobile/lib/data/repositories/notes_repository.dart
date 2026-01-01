import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:drop_mobile/data/models/models.dart';
import 'package:drop_mobile/data/providers/supabase_provider.dart';

part 'notes_repository.g.dart';

@Riverpod(keepAlive: true)
NotesRepository notesRepository(Ref ref) {
  return NotesRepository(ref.watch(supabaseClientProvider));
}

class NotesRepository {
  final SupabaseClient _client;

  NotesRepository(this._client);

  /// Load all notes with attachments and tags (including archived and deleted)
  Future<List<Note>> loadNotes() async {
    // Load all notes (including archived and trash)
    // Filter by view mode in the provider
    final noteRows = await _client
        .from('notes')
        .select()
        .order('created_at', ascending: false);

    final noteIds = noteRows.map((n) => n['id'] as String).toList();
    if (noteIds.isEmpty) return [];

    // Load attachments
    final attachmentRows = await _client
        .from('attachments')
        .select()
        .inFilter('note_id', noteIds)
        .order('created_at');

    // Load note_tags with tags
    final noteTagRows = await _client
        .from('note_tags')
        .select('note_id, tag_id, tags(*)')
        .inFilter('note_id', noteIds);

    // Group attachments by note
    final attachmentsByNote = <String, List<Attachment>>{};
    for (final row in attachmentRows) {
      final attachment = Attachment.fromRow(AttachmentRow.fromJson(row));
      attachmentsByNote.putIfAbsent(attachment.noteId, () => []).add(attachment);
    }

    // Group tags by note
    final tagsByNote = <String, List<Tag>>{};
    for (final row in noteTagRows) {
      final noteId = row['note_id'] as String;
      final tagData = row['tags'] as Map<String, dynamic>;
      final tag = Tag.fromRow(TagRow.fromJson(tagData));
      tagsByNote.putIfAbsent(noteId, () => []).add(tag);
    }

    // Combine notes with attachments and tags
    return noteRows.map((row) {
      final noteRow = NoteRow.fromJson(row);
      return Note.fromRow(
        noteRow,
        attachments: attachmentsByNote[noteRow.id] ?? [],
        tags: tagsByNote[noteRow.id] ?? [],
      );
    }).toList();
  }

  /// Create a new note
  Future<Note> createNote({
    String content = '',
    String? parentId,
  }) async {
    // Get current user
    final user = _client.auth.currentUser;
    if (user == null) {
      throw Exception('User not authenticated');
    }

    final data = await _client
        .from('notes')
        .insert({
          'content': content,
          'parent_id': parentId,
          'source': 'mobile',
          'user_id': user.id,
        })
        .select()
        .single();

    return Note.fromRow(NoteRow.fromJson(data));
  }

  /// Update note content
  Future<void> updateNote(String id, String content) async {
    await _client.from('notes').update({'content': content}).eq('id', id);
  }

  /// Soft delete a note (move to trash)
  Future<void> deleteNote(String id) async {
    await _client.from('notes').update({
      'is_deleted': true,
      'deleted_at': DateTime.now().toUtc().toIso8601String(),
      'archived_at': null, // Remove from archive if it was archived
    }).eq('id', id);
  }

  /// Archive a note
  Future<void> archiveNote(String id) async {
    await _client.from('notes').update({
      'archived_at': DateTime.now().toUtc().toIso8601String(),
    }).eq('id', id);
  }

  /// Unarchive a note (move back to active)
  Future<void> unarchiveNote(String id) async {
    await _client.from('notes').update({
      'archived_at': null,
    }).eq('id', id);
  }

  /// Restore a note from trash
  Future<void> restoreNote(String id) async {
    await _client.from('notes').update({
      'is_deleted': false,
      'deleted_at': null,
    }).eq('id', id);
  }

  /// Permanently delete a note
  Future<void> permanentlyDeleteNote(String id) async {
    await _client.from('notes').delete().eq('id', id);
  }

  /// Empty trash (permanently delete all trashed notes)
  Future<void> emptyTrash() async {
    final user = _client.auth.currentUser;
    if (user == null) return;

    await _client
        .from('notes')
        .delete()
        .eq('user_id', user.id)
        .not('deleted_at', 'is', null);
  }

  /// Update note categories based on content and attachments
  Future<void> updateNoteCategories(
    String id, {
    required bool hasLink,
    required bool hasMedia,
    required bool hasFiles,
  }) async {
    await _client.from('notes').update({
      'has_link': hasLink,
      'has_media': hasMedia,
      'has_files': hasFiles,
    }).eq('id', id);
  }

  /// Lock/unlock a note
  Future<void> setNoteLocked(String id, bool isLocked) async {
    await _client.from('notes').update({
      'is_locked': isLocked,
    }).eq('id', id);
  }

  /// Subscribe to realtime changes
  RealtimeChannel subscribeToChanges({
    required void Function(Note note) onInsert,
    required void Function(Note note) onUpdate,
    required void Function(String id) onDelete,
  }) {
    return _client
        .channel('notes-changes')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'notes',
          callback: (payload) {
            final eventType = payload.eventType;
            final newRecord = payload.newRecord;
            final oldRecord = payload.oldRecord;

            if (eventType == PostgresChangeEvent.insert) {
              final note = Note.fromRow(NoteRow.fromJson(newRecord));
              onInsert(note);
            } else if (eventType == PostgresChangeEvent.update) {
              // Pass the full note with all updated fields
              final note = Note.fromRow(NoteRow.fromJson(newRecord));
              onUpdate(note);
            } else if (eventType == PostgresChangeEvent.delete) {
              onDelete(oldRecord['id'] as String);
            }
          },
        )
        .subscribe();
  }
}
