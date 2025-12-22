// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recording_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Recording provider for managing voice recording and transcription

@ProviderFor(RecordingNotifier)
const recordingProvider = RecordingNotifierProvider._();

/// Recording provider for managing voice recording and transcription
final class RecordingNotifierProvider
    extends $NotifierProvider<RecordingNotifier, RecordingState> {
  /// Recording provider for managing voice recording and transcription
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

String _$recordingNotifierHash() => r'bd542fafad31ec56a2769d89958d24e6f56100f4';

/// Recording provider for managing voice recording and transcription

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
