// Plays a short two-tone chime using the Web Audio API — no external audio
// file, so nothing to 404 or fail to load in production.
//
// Browsers block audio playback until the user has interacted with the page
// at least once (click, tap, or keypress). Without handling that, the sound
// silently fails on some sessions and works on others depending on whether
// the user happened to click something first — which is almost certainly
// why the sound felt inconsistent. This module "unlocks" the AudioContext
// on the very first user interaction so playback is reliable afterwards.

let audioCtx: AudioContext | null = null;
let unlocked = false;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  return audioCtx;
}

function unlockOnce() {
  if (unlocked) return;
  const ctx = getContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  unlocked = true;
}

if (typeof window !== "undefined") {
  ["click", "keydown", "touchstart"].forEach((evt) =>
    window.addEventListener(evt, unlockOnce, { once: true, passive: true })
  );
}

export function playNewCustomerChime() {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    // Will only succeed if the page has already had a user interaction —
    // this is the browser's autoplay policy, not a bug we can bypass.
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const notes: Array<[number, number]> = [
    [880, now],
    [1174.66, now + 0.12],
  ];

  notes.forEach(([freq, startAt]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(0.18, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.28);
    osc.connect(gain).connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + 0.3);
  });
}
