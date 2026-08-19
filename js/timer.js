// Rest timer: countdown + completion beep, isolated from the session view so session.js can
// focus on rendering/state and not setInterval/AudioContext plumbing.

let intervalId = null;
let remainingSeconds = null;

export function isRunning() {
  return intervalId !== null;
}

export function getRemaining() {
  return remainingSeconds;
}

export function start(seconds, { onTick, onDone }) {
  pause();
  remainingSeconds = seconds;
  onTick(remainingSeconds);

  intervalId = setInterval(() => {
    remainingSeconds -= 1;
    if (remainingSeconds <= 0) {
      remainingSeconds = 0;
      onTick(remainingSeconds);
      pause();
      playBeep();
      onDone();
    } else {
      onTick(remainingSeconds);
    }
  }, 1000);
}

export function resume(callbacks) {
  if (remainingSeconds == null) return;
  start(remainingSeconds, callbacks);
}

export function pause() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function reset() {
  pause();
  remainingSeconds = null;
}

export function playBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.warn("Audio context blocked by policy", e);
  }
}
