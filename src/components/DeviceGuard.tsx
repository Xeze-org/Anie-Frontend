import { Navigate } from 'react-router-dom'
import { isMobileDevice } from '../lib/device'

/**
 * DesktopGuard — wraps a desktop-only route.
 * If the visitor is on mobile, redirects to /chat-mobile immediately.
 */
export function DesktopGuard({ children }: { children: React.ReactNode }) {
    if (isMobileDevice()) {
        return <Navigate to="/chat-mobile" replace />
    }
    return <>{children}</>
}

/**
 * MobileGuard — wraps a mobile-only route.
 * If the visitor is on desktop, redirects to /chat immediately.
 */
export function MobileGuard({ children }: { children: React.ReactNode }) {
    if (!isMobileDevice()) {
        return <Navigate to="/" replace />
    }
    return <>{children}</>
}
