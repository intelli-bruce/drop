import { useState, useCallback, DragEvent } from 'react'

interface UseDragAndDropOptions {
  onDrop: (files: File[]) => void | Promise<void>
}

interface UseDragAndDropReturn {
  isDragOver: boolean
  handleDragOver: (e: DragEvent) => void
  handleDragLeave: (e: DragEvent) => void
  handleDrop: (e: DragEvent) => void
}

/**
 * Custom hook for handling drag and drop file uploads
 */
export function useDragAndDrop({ onDrop }: UseDragAndDropOptions): UseDragAndDropReturn {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        onDrop(files)
      }
    },
    [onDrop]
  )

  return {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
