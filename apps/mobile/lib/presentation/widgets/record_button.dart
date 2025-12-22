import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:throw_mobile/data/services/audio_recorder_service.dart';
import 'package:throw_mobile/presentation/widgets/waveform_view.dart';

/// Recording button with waveform visualization
class RecordButton extends ConsumerStatefulWidget {
  final void Function(String audioPath)? onRecordingComplete;
  final VoidCallback? onRecordingStart;
  final VoidCallback? onRecordingCancel;

  const RecordButton({
    super.key,
    this.onRecordingComplete,
    this.onRecordingStart,
    this.onRecordingCancel,
  });

  @override
  ConsumerState<RecordButton> createState() => _RecordButtonState();
}

class _RecordButtonState extends ConsumerState<RecordButton>
    with SingleTickerProviderStateMixin {
  final AudioRecorderService _recorder = AudioRecorderService();
  late AnimationController _animationController;
  bool _showPermissionDialog = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );

    _recorder.onStateChanged = () {
      if (mounted) setState(() {});
    };

    _recorder.onMaxDurationReached = () {
      _onRecordingComplete();
    };
  }

  @override
  void dispose() {
    _animationController.dispose();
    _recorder.dispose();
    super.dispose();
  }

  Future<void> _handleTap() async {
    HapticFeedback.mediumImpact();

    if (_recorder.isRecording) {
      await _stopRecording();
    } else {
      await _startRecording();
    }
  }

  Future<void> _startRecording() async {
    final hasPermission = await _recorder.hasPermission();

    if (!hasPermission) {
      if (mounted) {
        setState(() => _showPermissionDialog = true);
      }
      return;
    }

    try {
      await _recorder.startRecording();
      _animationController.forward();
      widget.onRecordingStart?.call();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('녹음을 시작할 수 없습니다: $e')),
        );
      }
    }
  }

  Future<void> _stopRecording() async {
    final path = await _recorder.stopRecording();
    _animationController.reverse();

    if (path != null) {
      _onRecordingComplete(path);
    }
  }

  void _onRecordingComplete([String? path]) {
    if (path != null) {
      widget.onRecordingComplete?.call(path);
    }
  }

  Future<void> _cancelRecording() async {
    await _recorder.cancelRecording();
    _animationController.reverse();
    widget.onRecordingCancel?.call();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Waveform and time display (when recording)
        AnimatedSize(
          duration: const Duration(milliseconds: 200),
          child: _recorder.isRecording ? _buildRecordingView() : const SizedBox.shrink(),
        ),

        const SizedBox(height: 12),

        // Record button
        GestureDetector(
          onTap: _handleTap,
          onLongPress: _recorder.isRecording ? _cancelRecording : null,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: _recorder.isRecording ? Colors.red : const Color(0xFF4A9EFF),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.15),
                  blurRadius: 12,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Center(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                child: _recorder.isRecording
                    ? Container(
                        key: const ValueKey('stop'),
                        width: 24,
                        height: 24,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(6),
                        ),
                      )
                    : const Icon(
                        key: ValueKey('mic'),
                        Icons.mic,
                        color: Colors.white,
                        size: 32,
                      ),
              ),
            ),
          ),
        ),

        // Permission dialog
        if (_showPermissionDialog) _buildPermissionDialog(),
      ],
    );
  }

  Widget _buildRecordingView() {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A2A),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Waveform
          SizedBox(
            height: 40,
            child: WaveformView(
              levels: _recorder.audioLevels,
              color: const Color(0xFF4A9EFF),
            ),
          ),

          const SizedBox(height: 8),

          // Time display
          Text(
            _recorder.formattedTime,
            style: const TextStyle(
              color: Color(0xFF888888),
              fontSize: 16,
              fontFamily: 'monospace',
            ),
          ),

          const SizedBox(height: 4),

          // Cancel hint
          Text(
            '길게 눌러서 취소',
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPermissionDialog() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: const Color(0xFF2A2A2A),
          title: const Text(
            '마이크 권한 필요',
            style: TextStyle(color: Colors.white),
          ),
          content: const Text(
            '음성 메모를 녹음하려면 마이크 권한이 필요합니다.',
            style: TextStyle(color: Color(0xFFE0E0E0)),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                setState(() => _showPermissionDialog = false);
              },
              child: const Text('취소'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                setState(() => _showPermissionDialog = false);
                // Open app settings
                // openAppSettings();
              },
              child: const Text('설정으로 이동'),
            ),
          ],
        ),
      );
    });
    return const SizedBox.shrink();
  }
}
