import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:throw_mobile/data/models/models.dart';
import 'package:throw_mobile/data/services/audio_recorder_service.dart';
import 'package:throw_mobile/data/services/whisper_service.dart';
import 'package:throw_mobile/presentation/providers/notes_provider.dart';

part 'recording_provider.g.dart';

/// Recording state
enum RecordingState {
  idle,
  recording,
  transcribing,
  error,
}

/// Recording provider for managing voice recording and transcription
@riverpod
class RecordingNotifier extends _$RecordingNotifier {
  AudioRecorderService? _recorder;
  final WhisperService _whisperService = WhisperService();

  @override
  RecordingState build() {
    ref.onDispose(() {
      _recorder?.dispose();
    });
    return RecordingState.idle;
  }

  AudioRecorderService get recorder {
    _recorder ??= AudioRecorderService();
    return _recorder!;
  }

  bool get isRecording => recorder.isRecording;
  double get recordingTime => recorder.recordingTime;
  String get formattedTime => recorder.formattedTime;
  double get currentLevel => recorder.currentLevel;
  List<double> get audioLevels => recorder.audioLevels;

  /// Check microphone permission
  Future<bool> hasPermission() async {
    return recorder.hasPermission();
  }

  /// Start recording
  Future<void> startRecording() async {
    try {
      await recorder.startRecording();
      state = RecordingState.recording;
    } catch (e) {
      state = RecordingState.error;
      rethrow;
    }
  }

  /// Stop recording and transcribe
  Future<Note?> stopAndTranscribe({String? parentId}) async {
    final path = await recorder.stopRecording();
    if (path == null) return null;

    state = RecordingState.transcribing;

    try {
      // Transcribe audio
      final text = await _whisperService.transcribe(audioPath: path);

      // Create note with transcribed text
      final note = await ref.read(notesProvider.notifier).createNote(
            content: text,
            parentId: parentId,
          );

      // TODO: Upload audio file to storage and attach to note

      state = RecordingState.idle;
      return note;
    } catch (e) {
      state = RecordingState.error;

      // Still create note even if transcription fails
      final note = await ref.read(notesProvider.notifier).createNote(
            content: '[음성 메모 - 변환 실패]',
            parentId: parentId,
          );

      return note;
    } finally {
      // Clean up audio file
      await AudioRecorderService.deleteAudioFile(path);
    }
  }

  /// Cancel recording
  Future<void> cancelRecording() async {
    await recorder.cancelRecording();
    state = RecordingState.idle;
  }
}
