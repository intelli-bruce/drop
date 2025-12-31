interface Props {
  onUnlock: () => void
}

export function LockedNoteOverlay({ onUnlock }: Props) {
  return (
    <div className="locked-note-overlay">
      <div className="locked-note-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2h1m-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3z" />
        </svg>
      </div>
      <p className="locked-note-text">잠긴 노트</p>
      <button className="locked-note-btn" onClick={onUnlock}>
        잠금 해제
      </button>
    </div>
  )
}
