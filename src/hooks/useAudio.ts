import { useEffect, useRef } from "react";
import type { Sound } from "./useGame";
const notes: Record<Sound, number[]> = {
  select: [520],
  move: [330, 440],
  spawn: [260, 330, 390],
  match: [523, 659, 784, 1047],
  over: [392, 330, 262],
  invalid: [170],
};
export function useAudio(enabled: boolean) {
  const context = useRef<AudioContext | null>(null);
  useEffect(
    () => () => {
      void context.current?.close();
      context.current = null;
    },
    [],
  );
  return (kind: Sound) => {
    if (!enabled) return;
    try {
      const audio = (context.current ??= new AudioContext());
      void audio.resume().catch(() => undefined);
      notes[kind].forEach((frequency, i) => {
        const oscillator = audio.createOscillator(),
          gain = audio.createGain(),
          start = audio.currentTime + i * 0.065;
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.045, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.2);
      });
    } catch {
      /* Gameplay remains available without an audio device. */
    }
  };
}
