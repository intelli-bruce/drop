import 'dart:async';
import 'dart:io';

import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';

/// Audio recording service with metering support
class AudioRecorderService {
  final AudioRecorder _recorder = AudioRecorder();
  Timer? _recordingTimer;
  Timer? _meteringTimer;

  bool _isRecording = false;
  double _recordingTime = 0;
  double _currentLevel = 0;
  final List<double> _audioLevels = [];
  String? _currentRecordingPath;

  static const double maxDuration = 180; // 3 minutes
  static const int sampleRate = 44100;
  static const int numChannels = 1;

  // Getters
  bool get isRecording => _isRecording;
  double get recordingTime => _recordingTime;
  double get currentLevel => _currentLevel;
  List<double> get audioLevels => List.unmodifiable(_audioLevels);
  String? get currentRecordingPath => _currentRecordingPath;

  String get formattedTime {
    final minutes = (_recordingTime ~/ 60).toString();
    final seconds = (_recordingTime % 60).toInt().toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  double get remainingTime => (maxDuration - _recordingTime).clamp(0, maxDuration);

  // Callbacks
  void Function()? onStateChanged;
  void Function()? onMaxDurationReached;

  /// Get current amplitude for metering
  Future<Amplitude?> getAmplitude() async {
    if (!_isRecording) return null;
    return await _recorder.getAmplitude();
  }

  /// Check if microphone permission is granted
  Future<bool> hasPermission() async {
    return await _recorder.hasPermission();
  }

  /// Start recording
  Future<String> startRecording() async {
    if (_isRecording) {
      throw RecordingException('Already recording');
    }

    final hasPermission = await _recorder.hasPermission();
    if (!hasPermission) {
      throw RecordingException('Microphone permission not granted');
    }

    final directory = await getApplicationDocumentsDirectory();
    final fileName = '${DateTime.now().millisecondsSinceEpoch}.m4a';
    final filePath = '${directory.path}/$fileName';

    await _recorder.start(
      const RecordConfig(
        encoder: AudioEncoder.aacLc,
        sampleRate: sampleRate,
        numChannels: numChannels,
      ),
      path: filePath,
    );

    _currentRecordingPath = filePath;
    _isRecording = true;
    _recordingTime = 0;
    _audioLevels.clear();

    _startTimers();
    onStateChanged?.call();

    return filePath;
  }

  /// Stop recording and return the file path
  Future<String?> stopRecording() async {
    if (!_isRecording) return null;

    _stopTimers();

    final path = await _recorder.stop();
    _isRecording = false;

    final result = _currentRecordingPath;
    _currentRecordingPath = null;

    onStateChanged?.call();
    return result ?? path;
  }

  /// Cancel recording and delete the file
  Future<void> cancelRecording() async {
    if (!_isRecording) return;

    _stopTimers();

    await _recorder.stop();
    _isRecording = false;

    // Delete the file
    if (_currentRecordingPath != null) {
      try {
        final file = File(_currentRecordingPath!);
        if (await file.exists()) {
          await file.delete();
        }
      } catch (_) {}
    }

    _currentRecordingPath = null;
    onStateChanged?.call();
  }

  void _startTimers() {
    // Recording time timer (1 second interval)
    _recordingTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      _recordingTime += 1;
      onStateChanged?.call();

      if (_recordingTime >= maxDuration) {
        stopRecording();
        onMaxDurationReached?.call();
      }
    });

    // Audio metering timer (50ms interval)
    _meteringTimer = Timer.periodic(const Duration(milliseconds: 50), (_) async {
      final amplitude = await _recorder.getAmplitude();
      // Normalize from dB to 0-1 range
      // Typical range is -60dB to 0dB
      final level = ((amplitude.current + 60) / 60).clamp(0.0, 1.0);
      _currentLevel = level;
      _audioLevels.add(level);

      // Keep only last 50 samples
      if (_audioLevels.length > 50) {
        _audioLevels.removeAt(0);
      }

      onStateChanged?.call();
    });
  }

  void _stopTimers() {
    _recordingTimer?.cancel();
    _recordingTimer = null;
    _meteringTimer?.cancel();
    _meteringTimer = null;
  }

  /// Delete an audio file by path
  static Future<void> deleteAudioFile(String path) async {
    try {
      final file = File(path);
      if (await file.exists()) {
        await file.delete();
      }
    } catch (_) {}
  }

  /// Dispose resources
  void dispose() {
    _stopTimers();
    _recorder.dispose();
  }
}

class RecordingException implements Exception {
  final String message;
  RecordingException(this.message);

  @override
  String toString() => message;
}
