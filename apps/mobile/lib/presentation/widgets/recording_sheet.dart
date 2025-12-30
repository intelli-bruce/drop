import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drop_mobile/presentation/providers/recording_provider.dart';
import 'package:drop_mobile/presentation/widgets/waveform_view.dart';

/// Recording sheet for inline recording (deprecated - use NoteCard recording instead)
/// Kept for potential future use in reply recording scenarios.
class RecordingSheet extends ConsumerWidget {
  final String? parentId;

  const RecordingSheet({
    super.key,
    this.parentId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recordingState = ref.watch(recordingProvider);
    final isRecording = recordingState.isRecording;
    final isTranscribing = recordingState.isTranscribing;

    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: const Color(0xFF3A3A3A),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            isRecording
                ? '녹음 중...'
                : isTranscribing
                    ? '변환 중...'
                    : '음성 메모',
            style: TextStyle(
              color: isRecording
                  ? Colors.red
                  : isTranscribing
                      ? const Color(0xFF4A9EFF)
                      : Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          if (!isRecording && !isTranscribing)
            const Text(
              '버튼을 눌러 녹음을 시작하세요',
              style: TextStyle(
                color: Color(0xFF888888),
                fontSize: 13,
              ),
            ),
          const SizedBox(height: 20),

          // Waveform (when recording)
          if (isRecording)
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: const Color(0xFF2A2A2A),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  SizedBox(
                    height: 40,
                    child: WaveformView(
                      levels: recordingState.audioLevels,
                      color: Colors.red,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    recordingState.formattedTime,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
            ),

          // Progress indicator (when transcribing)
          if (isTranscribing)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Column(
                children: [
                  const Icon(
                    Icons.graphic_eq,
                    color: Color(0xFF4A9EFF),
                    size: 32,
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '음성을 텍스트로 변환 중...',
                    style: TextStyle(
                      color: Color(0xFFE0E0E0),
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const LinearProgressIndicator(minHeight: 2),
                ],
              ),
            ),

          // Record button
          if (!isTranscribing)
            GestureDetector(
              onTap: () {
                HapticFeedback.mediumImpact();
                if (isRecording) {
                  ref.read(recordingProvider.notifier).stopRecording();
                  Navigator.pop(context);
                } else {
                  ref.read(recordingProvider.notifier).startRecording(parentId: parentId);
                }
              },
              child: Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  color: isRecording ? Colors.red : const Color(0xFF4A9EFF),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.2),
                      blurRadius: 16,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Center(
                  child: isRecording
                      ? Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(6),
                          ),
                        )
                      : const Icon(
                          Icons.mic,
                          color: Colors.white,
                          size: 40,
                        ),
                ),
              ),
            ),

          if (isRecording)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: TextButton(
                onPressed: () {
                  ref.read(recordingProvider.notifier).cancelRecording();
                  Navigator.pop(context);
                },
                child: const Text(
                  '취소',
                  style: TextStyle(color: Color(0xFF888888)),
                ),
              ),
            ),

          const SizedBox(height: 8),
        ],
      ),
    );
  }
}
