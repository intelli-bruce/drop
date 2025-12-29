import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drop_mobile/presentation/providers/recording_provider.dart';
import 'package:drop_mobile/presentation/widgets/record_button.dart';

class RecordingSheet extends ConsumerWidget {
  final String? parentId;

  const RecordingSheet({
    super.key,
    this.parentId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recordingState = ref.watch(recordingProvider);
    final isTranscribing = recordingState == RecordingState.transcribing;

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
          const Text(
            '음성 메모',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            isTranscribing ? '변환 중...' : '버튼을 눌러 녹음을 시작하세요',
            style: const TextStyle(
              color: Color(0xFF888888),
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 20),
          if (isTranscribing)
            const LinearProgressIndicator(
              minHeight: 2,
            ),
          const SizedBox(height: 16),
          RecordButton(
            enabled: !isTranscribing,
            onRecordingComplete: (path) async {
              final notifier = ref.read(recordingProvider.notifier);
              try {
                await notifier.transcribeFromPath(
                  path: path,
                  parentId: parentId,
                );
                if (context.mounted) {
                  Navigator.pop(context);
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('변환에 실패했습니다: $e')),
                  );
                }
              }
            },
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}
