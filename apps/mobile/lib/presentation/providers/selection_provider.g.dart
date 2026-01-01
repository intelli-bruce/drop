// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'selection_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(Selection)
const selectionProvider = SelectionProvider._();

final class SelectionProvider
    extends $NotifierProvider<Selection, SelectionState> {
  const SelectionProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'selectionProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$selectionHash();

  @$internal
  @override
  Selection create() => Selection();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(SelectionState value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<SelectionState>(value),
    );
  }
}

String _$selectionHash() => r'2e6c74a59e95144ccf259e10cfd70ec985ecbe4c';

abstract class _$Selection extends $Notifier<SelectionState> {
  SelectionState build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<SelectionState, SelectionState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<SelectionState, SelectionState>,
              SelectionState,
              Object?,
              Object?
            >;
    element.handleValue(ref, created);
  }
}
