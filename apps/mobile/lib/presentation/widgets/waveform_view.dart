import 'dart:math';

import 'package:flutter/material.dart';

/// Real-time waveform visualization during recording
class WaveformView extends StatelessWidget {
  final List<double> levels;
  final double barWidth;
  final double spacing;
  final double minHeight;
  final Color? color;

  const WaveformView({
    super.key,
    required this.levels,
    this.barWidth = 3,
    this.spacing = 2,
    this.minHeight = 4,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final maxBars = (constraints.maxWidth / (barWidth + spacing)).floor();
        final displayLevels = _getDisplayLevels(maxBars);

        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: displayLevels.asMap().entries.map((entry) {
            final level = entry.value;
            final height = max(minHeight, level * constraints.maxHeight);

            return Container(
              width: barWidth,
              height: height,
              margin: EdgeInsets.symmetric(horizontal: spacing / 2),
              decoration: BoxDecoration(
                color: color ?? Theme.of(context).colorScheme.primary,
                borderRadius: BorderRadius.circular(barWidth / 2),
              ),
            );
          }).toList(),
        );
      },
    );
  }

  List<double> _getDisplayLevels(int maxBars) {
    if (levels.isEmpty) {
      return List.filled(maxBars, 0.1);
    }

    final displayCount = min(levels.length, maxBars);
    return levels.sublist(max(0, levels.length - displayCount));
  }
}

/// Static waveform visualization for playback
class StaticWaveformView extends StatefulWidget {
  final String? audioPath;
  final double barWidth;
  final double spacing;
  final int barCount;
  final Color? color;

  const StaticWaveformView({
    super.key,
    this.audioPath,
    this.barWidth = 2,
    this.spacing = 1,
    this.barCount = 30,
    this.color,
  });

  @override
  State<StaticWaveformView> createState() => _StaticWaveformViewState();
}

class _StaticWaveformViewState extends State<StaticWaveformView> {
  late List<double> _levels;

  @override
  void initState() {
    super.initState();
    _generateRandomLevels();
  }

  void _generateRandomLevels() {
    final random = Random();
    _levels = List.generate(
      widget.barCount,
      (_) => 0.2 + random.nextDouble() * 0.8,
    );
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: _levels.asMap().entries.map((entry) {
            final level = entry.value;
            final height = max(4.0, level * constraints.maxHeight);

            return Container(
              width: widget.barWidth,
              height: height,
              margin: EdgeInsets.symmetric(horizontal: widget.spacing / 2),
              decoration: BoxDecoration(
                color: (widget.color ?? Theme.of(context).colorScheme.primary)
                    .withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(widget.barWidth / 2),
              ),
            );
          }).toList(),
        );
      },
    );
  }
}
