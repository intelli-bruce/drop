declare module 'react-file-icon' {
  import { ComponentType } from 'react'

  export interface FileIconProps {
    extension?: string
    color?: string
    fold?: boolean
    foldColor?: string
    glyphColor?: string
    gradientColor?: string
    gradientOpacity?: number
    labelColor?: string
    labelTextColor?: string
    labelTextStyle?: object
    labelUppercase?: boolean
    radius?: number
    type?: string
    [key: string]: unknown
  }

  export const FileIcon: ComponentType<FileIconProps>

  export const defaultStyles: Record<
    string,
    Partial<FileIconProps>
  >
}
