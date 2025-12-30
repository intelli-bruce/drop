import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../stores/auth'

export function UserMenu() {
  const { user, signOut } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const userEmail = user.email || ''
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || userEmail
  const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture
  const initials = userName.charAt(0).toUpperCase()

  const handleSignOut = async () => {
    setIsOpen(false)
    await signOut()
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        {userAvatar ? (
          <img src={userAvatar} alt={userName} className="user-avatar" />
        ) : (
          <div className="user-avatar-placeholder">{initials}</div>
        )}
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="user-avatar-large" />
            ) : (
              <div className="user-avatar-placeholder-large">{initials}</div>
            )}
            <div className="user-info">
              <span className="user-name">{userName}</span>
              {userName !== userEmail && <span className="user-email">{userEmail}</span>}
            </div>
          </div>

          <div className="user-menu-divider" />

          <button className="user-menu-item" onClick={handleSignOut}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      )}

      <style>{`
        .user-menu {
          position: relative;
          z-index: 10000;
          -webkit-app-region: no-drag;
          pointer-events: auto;
        }

        .user-menu-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          background: transparent;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: opacity 0.2s;
          -webkit-app-region: no-drag;
          pointer-events: auto;
        }

        .user-menu-trigger:hover {
          opacity: 0.8;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-menu-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 240px;
          background: #2a2a2a;
          border: 1px solid #3a3a3a;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          overflow: hidden;
        }

        .user-menu-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
        }

        .user-avatar-large {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-avatar-placeholder-large {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 12px;
          color: #888;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-menu-divider {
          height: 1px;
          background: #3a3a3a;
          margin: 0 8px;
        }

        .user-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          color: #ccc;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .user-menu-item:hover {
          background: #3a3a3a;
          color: #fff;
        }

        .user-menu-item svg {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}
