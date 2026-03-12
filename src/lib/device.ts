/**
 * Device detection utilities.
 * Used to route users to the correct chat experience:
 *   - Desktop → /chat
 *   - Mobile  → /chat-mobile
 */

export const isMobileDevice = (): boolean => {
    // Screen width check (primary)
    const narrowScreen = window.innerWidth < 768

    // User-agent check (covers cases where UA is injected by app)
    const mobileUA = /Android|iPhone|iPad|iPod|Mobile|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    )

    // Touch capability check (secondary signal)
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    return narrowScreen || (mobileUA && hasTouch)
}
