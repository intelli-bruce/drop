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

  /// Load all notes with attachments and tags
  Future<List<Note>> loadNotes() async {
    // Load notes
    final noteRows = await _client
        .from('notes')
        .select()
        .eq('is_deleted', false)
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
    final data = await _client
        .from('notes')
        .insert({
          'content': content,
          'parent_id': parentId,
          'source': 'mobile',
        })
        .select()
        .single();

    return Note.fromRow(NoteRow.fromJson(data));
  }

  /// Update note content
  Future<void> updateNote(String id, String content) async {
    await _client.from('notes').update({'content': content}).eq('id', id);
  }

  /// Soft delete a note
  Future<void> deleteNote(String id) async {
    await _client.from('notes').update({'is_deleted': true}).eq('id', id);
  }

  /// Subscribe to realtime changes
  RealtimeChannel subscribeToChanges({
    required void Function(Note note) onInsert,
    required void Function(String id, String content, DateTime updatedAt) onUpdate,
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
              final isDeleted = newRecord['is_deleted'] as bool? ?? false;
              if (isDeleted) {
                onDelete(newRecord['id'] as String);
              } else {
                onUpdate(
                  newRecord['id'] as String,
                  newRecord['content'] as String? ?? '',
                  DateTime.parse(newRecord['updated_at'] as String),
                );
              }
            } else if (eventType == PostgresChangeEvent.delete) {
              onDelete(oldRecord['id'] as String);
            }
          },
        )
        .subscribe();
  }
}
