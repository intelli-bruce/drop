import 'dart:io';

import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:drop_mobile/data/models/models.dart';
import 'package:drop_mobile/data/services/audio_recorder_service.dart';
import 'package:drop_mobile/data/repositories/attachments_repository.dart';
import 'package:drop_mobile/data/services/whisper_service.dart';
import 'package:drop_mobile/presentation/providers/notes_provider.dart';

part 'recording_provider.g.dart';

/// Recording state
enum RecordingState {
  idle,
  transcribing,
  error,
}

/// Provider for managing audio transcription
@riverpod
class RecordingNotifier extends _$RecordingNotifier {
  final WhisperService _whisperService = WhisperService();

  @override
  RecordingState build() {
    return RecordingState.idle;
  }

  /// Transcribe an existing audio file and create a note
  Future<Note?> transcribeFromPath({
    required String path,
    String? parentId,
  }) async {
    state = RecordingState.transcribing;

    try {
      // Transcribe audio
      final text = await _whisperService.transcribe(audioPath: path);

      // Create note with transcribed text
      final note = await ref.read(notesProvider.notifier).createNote(
            content: text,
            parentId: parentId,
          );

      await _attachAudioToNote(note.id, path);

      state = RecordingState.idle;
      return note;
    } catch (e) {
      state = RecordingState.error;

      // Still create note even if transcription fails
      final note = await ref.read(notesProvider.notifier).createNote(
            content: '[음성 메모 - 변환 실패]',
            parentId: parentId,
          );

      await _attachAudioToNote(note.id, path);

      state = RecordingState.idle;
      return note;
    } finally {
      // Clean up audio file
      await AudioRecorderService.deleteAudioFile(path);
    }
  }

  Future<void> _attachAudioToNote(String noteId, String path) async {
    final file = File(path);
    if (!await file.exists()) return;

    try {
      final attachment = await ref
          .read(attachmentsRepositoryProvider)
          .createAudioAttachment(noteId: noteId, file: file);
      ref.read(notesProvider.notifier).addAttachmentToNote(noteId, attachment);
    } catch (_) {}
  }
}
