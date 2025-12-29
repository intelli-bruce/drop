// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recording_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Provider for managing audio transcription

@ProviderFor(RecordingNotifier)
const recordingProvider = RecordingNotifierProvider._();

/// Provider for managing audio transcription
final class RecordingNotifierProvider
    extends $NotifierProvider<RecordingNotifier, RecordingState> {
  /// Provider for managing audio transcription
  const RecordingNotifierProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'recordingProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$recordingNotifierHash();

  @$internal
  @override
  RecordingNotifier create() => RecordingNotifier();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(RecordingState value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<RecordingState>(value),
    );
  }
}

String _$recordingNotifierHash() => r'9c48af408725e56823995932dff04025c12c219d';

/// Provider for managing audio transcription

abstract class _$RecordingNotifier extends $Notifier<RecordingState> {
  RecordingState build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<RecordingState, RecordingState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<RecordingState, RecordingState>,
              RecordingState,
              Object?,
              Object?
            >;
    element.handleValue(ref, created);
  }
}
