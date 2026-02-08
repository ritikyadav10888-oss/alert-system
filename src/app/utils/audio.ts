'use client';

/**
 * Utility to play notification sounds
 * Note: Browsers require a user interaction (click) on the page before they allow audio playback.
 */
export const playCashRegisterSound = () => {
    try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => {
            console.warn("Audio playback blocked by browser. Click anywhere on the dashboard to enable sounds.", e);
        });
    } catch (e) {
        console.error("Audio playback error:", e);
    }
};

export const playNotificationChime = () => {
    try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.volume = 0.4;
        audio.play().catch(e => console.warn("Audio playback blocked."));
    } catch (e) {
        console.error("Audio playback error:", e);
    }
};
