import { useEffect, useCallback, DependencyList } from 'react'

/**
 * Custom hook for handling global keyboard shortcuts
 * Automatically adds and removes event listener
 */
export function useGlobalKeyboardShortcut(
  matcher: (e: KeyboardEvent) => boolean,
  handler: (e: KeyboardEvent) => void,
  deps: DependencyList = []
): void {
  const stableHandler = useCallback(
    (e: KeyboardEvent) => {
      if (matcher(e)) {
        handler(e)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [matcher, handler, ...deps]
  )

  useEffect(() => {
    window.addEventListener('keydown', stableHandler)
    return () => window.removeEventListener('keydown', stableHandler)
  }, [stableHandler])
}
