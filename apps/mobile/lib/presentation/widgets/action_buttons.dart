import 'package:flutter/material.dart';

const _fabBackgroundColor = Color(0xFF4A9EFF);

/// FAB action buttons for home screen
/// Contains: Gallery, Camera, Record, Add buttons
class ActionButtons extends StatelessWidget {
  final bool isRecording;
  final VoidCallback onAddPressed;
  final VoidCallback onRecordPressed;
  final VoidCallback onCameraPressed;
  final VoidCallback onGalleryPressed;

  const ActionButtons({
    super.key,
    required this.isRecording,
    required this.onAddPressed,
    required this.onRecordPressed,
    required this.onCameraPressed,
    required this.onGalleryPressed,
  });

  @override
  Widget build(BuildContext context) {
    // Hide other buttons when recording
    if (isRecording) {
      return AddFab(onPressed: onAddPressed);
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        GalleryFab(onPressed: onGalleryPressed),
        const SizedBox(height: 12),
        CameraFab(onPressed: onCameraPressed),
        const SizedBox(height: 12),
        RecordFab(onPressed: onRecordPressed),
        const SizedBox(height: 12),
        AddFab(onPressed: onAddPressed),
      ],
    );
  }
}

/// Gallery FAB - Opens photo gallery for multi-select
class GalleryFab extends StatelessWidget {
  final VoidCallback onPressed;

  const GalleryFab({
    super.key,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      heroTag: 'gallery',
      onPressed: onPressed,
      backgroundColor: _fabBackgroundColor,
      child: const Icon(Icons.photo_library),
    );
  }
}

/// Camera FAB - Opens camera to capture photo
class CameraFab extends StatelessWidget {
  final VoidCallback onPressed;

  const CameraFab({
    super.key,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      heroTag: 'camera',
      onPressed: onPressed,
      backgroundColor: _fabBackgroundColor,
      child: const Icon(Icons.camera_alt),
    );
  }
}

/// Record FAB - Starts voice recording
class RecordFab extends StatelessWidget {
  final VoidCallback onPressed;

  const RecordFab({
    super.key,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      heroTag: 'record',
      onPressed: onPressed,
      backgroundColor: _fabBackgroundColor,
      child: const Icon(Icons.mic),
    );
  }
}

/// Add FAB - Opens note composer
class AddFab extends StatelessWidget {
  final VoidCallback onPressed;

  const AddFab({
    super.key,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      heroTag: 'add',
      onPressed: onPressed,
      backgroundColor: _fabBackgroundColor,
      child: const Icon(Icons.add),
    );
  }
}
