export type Sound = "select" | "move" | "spawn" | "match" | "over" | "invalid";
interface Note {
  frequency: number;
  endFrequency?: number;
  delay?: number;
  duration: number;
  volume: number;
  wave?: OscillatorType;
}
// Short, local synth voices: a tap, a glide, three pops, a chime and a soft ending.
const effects: Record<Sound, Note[]> = {
  select: [{ frequency: 880, endFrequency: 660, duration: 0.1, volume: 0.16 }],
  move: [
    {
      frequency: 240,
      endFrequency: 620,
      duration: 0.18,
      volume: 0.12,
      wave: "triangle",
    },
    {
      frequency: 480,
      endFrequency: 930,
      delay: 0.035,
      duration: 0.15,
      volume: 0.035,
    },
  ],
  spawn: [392, 494, 587].map((frequency, i) => ({
    frequency: frequency * 1.6,
    endFrequency: frequency,
    delay: i * 0.08,
    duration: 0.14,
    volume: 0.13,
  })),
  match: [523.25, 659.25, 783.99, 1046.5].flatMap((frequency, i) => [
    { frequency, delay: i * 0.065, duration: 0.42, volume: 0.11 },
    {
      frequency: frequency * 2,
      delay: i * 0.065,
      duration: 0.22,
      volume: 0.025,
    },
  ]),
  over: [392, 329.63, 261.63].map((frequency, i) => ({
    frequency,
    delay: i * 0.16,
    duration: 0.42,
    volume: 0.1,
    wave: "triangle",
  })),
  invalid: [
    {
      frequency: 160,
      endFrequency: 110,
      duration: 0.15,
      volume: 0.09,
      wave: "triangle",
    },
  ],
};

export function scheduleSound(
  audio: BaseAudioContext,
  output: AudioNode,
  kind: Sound,
): OscillatorNode[] {
  return effects[kind].map((note) => {
    const oscillator = audio.createOscillator();
    const envelope = audio.createGain();
    const start = audio.currentTime + (note.delay ?? 0);
    const end = start + note.duration;
    oscillator.type = note.wave ?? "sine";
    oscillator.frequency.setValueAtTime(note.frequency, start);
    if (note.endFrequency)
      oscillator.frequency.exponentialRampToValueAtTime(note.endFrequency, end);
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(note.volume, start + 0.008);
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);
    envelope.gain.linearRampToValueAtTime(0, end + 0.015);
    oscillator.connect(envelope);
    envelope.connect(output);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
    oscillator.start(start);
    oscillator.stop(end + 0.02);
    return oscillator;
  });
}
