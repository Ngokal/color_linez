import { useEffect, useRef } from "react";
import { scheduleSound, type Sound } from "../audio/soundEffects";

export function useAudio(enabled: boolean) {
  const context = useRef<AudioContext | null>(null);
  const voices = useRef(new Set<OscillatorNode>());
  const audible = useRef(enabled);
  audible.current = enabled;

  useEffect(() => {
    if (!enabled) {
      for (const voice of voices.current) voice.stop();
      voices.current.clear();
    }
  }, [enabled]);
  useEffect(() => {
    const active = voices.current;
    return () => {
      active.clear();
      const audio = context.current;
      context.current = null;
      if (audio && audio.state !== "closed")
        void audio.close().catch(() => undefined);
    };
  }, []);

  function play(kind: Sound) {
    if (!audible.current) return;
    try {
      const audio = (context.current ??= new AudioContext());
      const schedule = () => {
        // A pending browser unlock or a previous animation must not override mute.
        if (
          !audible.current ||
          context.current !== audio ||
          audio.state !== "running"
        )
          return;
        for (const voice of scheduleSound(audio, audio.destination, kind)) {
          voices.current.add(voice);
          voice.addEventListener("ended", () => voices.current.delete(voice), {
            once: true,
          });
        }
      };
      // Called directly from selection/toggle gestures so mobile browsers can unlock audio.
      if (audio.state === "running") schedule();
      else
        void audio
          .resume()
          .then(schedule)
          .catch(() => undefined);
    } catch {
      // Audio support or a missing output device must never interrupt a game.
    }
  }
  function preview() {
    audible.current = true;
    play("select");
  }
  return { play, preview };
}
