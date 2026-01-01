// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recording_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Provider for managing audio recording and transcription

@ProviderFor(RecordingNotifier)
const recordingProvider = RecordingNotifierProvider._();

/// Provider for managing audio recording and transcription
final class RecordingNotifierProvider
    extends $NotifierProvider<RecordingNotifier, RecordingState> {
  /// Provider for managing audio recording and transcription
  const RecordingNotifierProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'recordingProvider',
        isAutoDispose: false,
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

String _$recordingNotifierHash() => r'f47468e1e908502803b4cad63a33200c9fbe103c';

/// Provider for managing audio recording and transcription

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
