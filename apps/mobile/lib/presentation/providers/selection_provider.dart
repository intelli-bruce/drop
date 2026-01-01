import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'selection_provider.g.dart';

@immutable
class SelectionState {
  final bool isSelectionMode;
  final Set<String> selectedIds;

  const SelectionState({
    this.isSelectionMode = false,
    this.selectedIds = const {},
  });

  SelectionState copyWith({
    bool? isSelectionMode,
    Set<String>? selectedIds,
  }) {
    return SelectionState(
      isSelectionMode: isSelectionMode ?? this.isSelectionMode,
      selectedIds: selectedIds ?? this.selectedIds,
    );
  }

  int get selectedCount => selectedIds.length;
  bool get hasSelection => selectedIds.isNotEmpty;
}

@riverpod
class Selection extends _$Selection {
  @override
  SelectionState build() => const SelectionState();

  /// Enter selection mode, optionally with an initial note selected
  void enterSelectionMode([String? initialNoteId]) {
    state = SelectionState(
      isSelectionMode: true,
      selectedIds: initialNoteId != null ? {initialNoteId} : {},
    );
  }

  /// Exit selection mode and clear all selections
  void exitSelectionMode() {
    state = const SelectionState();
  }

  /// Toggle selection for a specific note
  void toggleSelection(String noteId) {
    final newSelectedIds = Set<String>.from(state.selectedIds);

    if (newSelectedIds.contains(noteId)) {
      newSelectedIds.remove(noteId);
    } else {
      newSelectedIds.add(noteId);
    }

    // Auto exit selection mode if no notes selected
    if (newSelectedIds.isEmpty) {
      exitSelectionMode();
      return;
    }

    state = state.copyWith(selectedIds: newSelectedIds);
  }

  /// Select all notes from the given list
  void selectAll(List<String> noteIds) {
    state = state.copyWith(selectedIds: noteIds.toSet());
  }

  /// Deselect all notes
  void deselectAll() {
    state = state.copyWith(selectedIds: {});
  }

  /// Check if a specific note is selected
  bool isSelected(String noteId) {
    return state.selectedIds.contains(noteId);
  }
}
