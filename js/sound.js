let context;
let lastScratchAt = 0;

function audio() {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return null;
  context ??= new Audio();
  if (context.state === 'suspended') context.resume();
  return context;
}

function tone(frequency, duration, { delay = 0, type = 'sine', volume = .06 } = {}) {
  const ctx = audio();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + delay;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + .01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .02);
}

export function createSoundEffects() {
  return {
    scratch() {
      if (performance.now() - lastScratchAt < 85) return;
      lastScratchAt = performance.now();
      const ctx = audio();
      if (!ctx) return;
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * .045), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      filter.type = 'bandpass'; filter.frequency.value = 1700; filter.Q.value = .7; gain.gain.value = .025;
      source.buffer = buffer;
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
    },
    reveal() {
      tone(523, .2, { type: 'triangle', volume: .09 });
      tone(659, .2, { delay: .1, type: 'triangle', volume: .09 });
      tone(784, .24, { delay: .2, type: 'triangle', volume: .1 });
      tone(1047, .65, { delay: .3, type: 'triangle', volume: .13 });
      tone(784, .65, { delay: .3, type: 'sine', volume: .07 });
    },
    click() { tone(760, .055, { type: 'square', volume: .035 }); }
  };
}
