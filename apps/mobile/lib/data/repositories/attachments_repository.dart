import 'dart:io';
import 'dart:math';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:drop_mobile/data/models/attachment.dart';
import 'package:drop_mobile/data/providers/supabase_provider.dart';

final attachmentsRepositoryProvider = Provider<AttachmentsRepository>((ref) {
  final client = ref.watch(supabaseClientProvider);
  return AttachmentsRepository(client);
});

final attachmentSignedUrlProvider = FutureProvider.family<String, String>(
  (ref, storagePath) async {
    final repository = ref.watch(attachmentsRepositoryProvider);
    return repository.createSignedUrl(storagePath);
  },
);

class AttachmentsRepository {
  final SupabaseClient _client;

  AttachmentsRepository(this._client);

  Future<Attachment> createAudioAttachment({
    required String noteId,
    required File file,
  }) async {
    final fileName = _fileName(file.path);
    final extension = _fileExtension(fileName, fallback: 'm4a');
    final storagePath = '$noteId/${_randomId()}.$extension';
    final mimeType = 'audio/m4a';
    final size = await file.length();

    await _client.storage.from('attachments').upload(
          storagePath,
          file,
          fileOptions: FileOptions(contentType: mimeType),
        );

    final data = await _client
        .from('attachments')
        .insert({
          'note_id': noteId,
          'type': 'audio',
          'storage_path': storagePath,
          'filename': fileName,
          'mime_type': mimeType,
          'size': size,
        })
        .select()
        .single();

    return Attachment.fromRow(AttachmentRow.fromJson(data));
  }

  Future<String> createSignedUrl(
    String storagePath, {
    int expiresIn = 60 * 60,
  }) async {
    return _client.storage.from('attachments').createSignedUrl(
          storagePath,
          expiresIn,
        );
  }
}

String _fileName(String path) {
  final segments = Uri.file(path).pathSegments;
  return segments.isEmpty ? 'audio.m4a' : segments.last;
}

String _fileExtension(String fileName, {required String fallback}) {
  final index = fileName.lastIndexOf('.');
  if (index == -1 || index == fileName.length - 1) return fallback;
  return fileName.substring(index + 1);
}

String _randomId() {
  final random = Random();
  final time = DateTime.now().microsecondsSinceEpoch;
  final salt = random.nextInt(1 << 32);
  return '${time}_$salt';
}
