import { useState, useEffect, useRef } from 'react'
import { useProfileStore } from '../stores/profile'
import { isValidPin } from '../lib/pin-utils'

export type PinDialogMode = 'setup' | 'unlock-temp' | 'unlock-permanent' | 'unlock-all'

interface Props {
  mode: PinDialogMode
  onSuccess: () => void
  onCancel: () => void
}

export function PinDialog({ mode, onSuccess, onCancel }: Props) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const verifyPin = useProfileStore((s) => s.verifyPin)
  const setNewPin = useProfileStore((s) => s.setPin)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const getTitle = () => {
    switch (mode) {
      case 'setup':
        return 'PIN 설정'
      case 'unlock-temp':
        return '일시 잠금 해제'
      case 'unlock-permanent':
        return '완전 잠금 해제'
      case 'unlock-all':
        return '전체 일시 해제'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (mode === 'setup') {
        // PIN 설정 모드
        if (!isValidPin(pin)) {
          setError('PIN은 4-6자리 숫자여야 합니다')
          return
        }
        if (pin !== confirmPin) {
          setError('PIN이 일치하지 않습니다')
          return
        }
        await setNewPin(pin)
        onSuccess()
      } else {
        // unlock-temp, unlock-permanent, unlock-all: PIN 확인만
        const valid = await verifyPin(pin)
        if (valid) {
          onSuccess()
        } else {
          setError('PIN이 일치하지 않습니다')
          setPin('')
          inputRef.current?.focus()
        }
      }
    } catch (err) {
      setError('오류가 발생했습니다')
      console.error('[PinDialog]', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="pin-dialog-backdrop" onClick={onCancel} onKeyDown={handleKeyDown}>
      <div className="pin-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="pin-dialog-title">{getTitle()}</h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="PIN (4-6자리)"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="pin-dialog-input"
            disabled={isLoading}
          />
          {mode === 'setup' && (
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="PIN 확인"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              className="pin-dialog-input"
              disabled={isLoading}
            />
          )}
          {error && <p className="pin-dialog-error">{error}</p>}
          <div className="pin-dialog-actions">
            <button type="button" onClick={onCancel} disabled={isLoading}>
              취소
            </button>
            <button type="submit" disabled={isLoading || pin.length < 4}>
              {isLoading ? '...' : '확인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
