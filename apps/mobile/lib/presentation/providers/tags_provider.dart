import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:drop_mobile/data/models/models.dart';
import 'package:drop_mobile/data/providers/supabase_provider.dart';
import 'package:drop_mobile/presentation/providers/notes_provider.dart';

part 'tags_provider.g.dart';

/// Tag with note count for tag management screen
class TagWithCount {
  final Tag tag;
  final int noteCount;
  final DateTime? lastUsedAt;

  const TagWithCount({
    required this.tag,
    required this.noteCount,
    this.lastUsedAt,
  });
}

@riverpod
class TagsNotifier extends _$TagsNotifier {
  @override
  Future<List<TagWithCount>> build() async {
    final client = ref.watch(supabaseClientProvider);
    return _loadTagsWithCounts(client);
  }

  Future<List<TagWithCount>> _loadTagsWithCounts(SupabaseClient client) async {
    // Load all tags with note counts
    final tagsData = await client
        .from('tags')
        .select('*, note_tags(count)')
        .order('last_used_at', ascending: false, nullsFirst: false);

    return tagsData.map((row) {
      final tag = Tag.fromRow(TagRow.fromJson(row));
      final noteTagsData = row['note_tags'] as List<dynamic>?;
      final noteCount = noteTagsData?.isNotEmpty == true
          ? (noteTagsData!.first['count'] as int? ?? 0)
          : 0;
      final lastUsedAtStr = row['last_used_at'] as String?;
      final lastUsedAt =
          lastUsedAtStr != null ? DateTime.tryParse(lastUsedAtStr) : null;

      return TagWithCount(
        tag: tag,
        noteCount: noteCount,
        lastUsedAt: lastUsedAt,
      );
    }).toList();
  }

  /// Add a tag to a note (creates tag if it doesn't exist)
  Future<void> addTagToNote(String noteId, String tagName) async {
    final client = ref.read(supabaseClientProvider);
    final trimmedName = tagName.trim().toLowerCase();
    if (trimmedName.isEmpty) return;

    // Check if tag exists
    final existingTags = await client
        .from('tags')
        .select()
        .eq('name', trimmedName)
        .maybeSingle();

    String tagId;
    if (existingTags != null) {
      tagId = existingTags['id'] as String;
      // Update last_used_at
      await client.from('tags').update({
        'last_used_at': DateTime.now().toUtc().toIso8601String(),
      }).eq('id', tagId);
    } else {
      // Create new tag
      final newTag = await client
          .from('tags')
          .insert({
            'name': trimmedName,
            'last_used_at': DateTime.now().toUtc().toIso8601String(),
          })
          .select()
          .single();
      tagId = newTag['id'] as String;
    }

    // Link tag to note (ignore if already exists)
    await client.from('note_tags').upsert({
      'note_id': noteId,
      'tag_id': tagId,
    });

    // Refresh tags list
    ref.invalidateSelf();
    // Refresh notes to show updated tags
    ref.invalidate(notesProvider);
  }

  /// Remove a tag from a note
  Future<void> removeTagFromNote(String noteId, String tagId) async {
    final client = ref.read(supabaseClientProvider);

    await client
        .from('note_tags')
        .delete()
        .eq('note_id', noteId)
        .eq('tag_id', tagId);

    // Refresh tags list
    ref.invalidateSelf();
    // Refresh notes to show updated tags
    ref.invalidate(notesProvider);
  }

  /// Update tag name
  Future<void> updateTag(String tagId, String newName) async {
    final client = ref.read(supabaseClientProvider);
    final trimmedName = newName.trim().toLowerCase();
    if (trimmedName.isEmpty) return;

    await client.from('tags').update({
      'name': trimmedName,
    }).eq('id', tagId);

    // Refresh tags list
    ref.invalidateSelf();
    // Refresh notes to show updated tag names
    ref.invalidate(notesProvider);
  }

  /// Delete a tag entirely
  Future<void> deleteTag(String tagId) async {
    final client = ref.read(supabaseClientProvider);

    // note_tags will be deleted automatically due to CASCADE
    await client.from('tags').delete().eq('id', tagId);

    // Refresh tags list
    ref.invalidateSelf();
    // Refresh notes to show updated tags
    ref.invalidate(notesProvider);
  }
}

/// Provides all tags ordered by last_used_at (for tag selector)
@riverpod
List<Tag> allTags(Ref ref) {
  final tagsWithCounts = ref.watch(tagsProvider).value ?? [];
  return tagsWithCounts.map((t) => t.tag).toList();
}
