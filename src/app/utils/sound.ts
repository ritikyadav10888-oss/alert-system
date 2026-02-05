export const playAlertSound = async () => {
    try {
        // 1. Play the MP3 file if it exists/works
        const audio = new Audio('/alert.mp3');
        audio.play().catch(() => {
            // Fallback to Beep if MP3 fails
            playBeep();
        });

        // 2. Add Voice Alert ("New Booking Received")
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance("New booking received");
            utterance.rate = 1.0;
            utterance.pitch = 1.1;
            window.speechSynthesis.speak(utterance);
        }
    } catch (e) {
        console.error("Audio playback failed", e);
    }
};

const playBeep = () => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, context.currentTime); // A5 note
    osc.connect(gain);
    gain.connect(context.destination);

    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.5);

    osc.start();
    osc.stop(context.currentTime + 0.5);
};
