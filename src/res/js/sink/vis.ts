import "crossani";

export function show(x: number, y: number, dur = 200) {
  const elem = document.getElementById(`${x}-${y}`);
  elem.doTransition({
    state: { opacity: "1" },
    ms: 50,
  });
  elem.doTransition({
    reset: true,
    ms: dur - 50,
  });
}

export function showArea(
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  dur = 250
) {
  for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) show(x, y, dur);
}

let BPM: number;
export const beats = (n: number) => 1000 * n * (60 / BPM);
export const bars = (n: number) => beats(n) * 4;
// while (notYet(FINISHED)) {}
export let FINISHED: number;

// await for_(time);
export const for_ = (t: number) => new Promise<void>((r) => setTimeout(r, t));

let start: DOMHighResTimeStamp;
// await until(time)
export const until = (t: number) => for_(t + performance.now() - start);

// while (notYet(time)) {}
export const notYet = (t: number) => performance.now() - start < t;

// if (inRange(time, time)) continue;
export const inRange = (tS: number, tE: number) =>
  performance.now() - start > tS && performance.now() - start < tE;

// await skipBar(bar number);
export async function skipBar(n: number) {
  const currentTime = performance.now() - start;

  if (inRange(bars(n), bars(n + 1))) await for_(bars(n + 1) - currentTime);
}

export function play(
  tracks: { [key: string]: () => Promise<void> },
  bpm: number,
  lenBars: number,
  progressCallback = (txt: string) => {}
) {
  start = performance.now();
  BPM = bpm;
  FINISHED = bars(lenBars);
  const finishPromise = Promise.all(Object.values(tracks).map((t) => t()));

  const stopInterval = setInterval(() => {
    const currentTime = performance.now() - start;
    const barLen = Math.floor(currentTime / bars(1));
    const notBars = currentTime - bars(barLen);
    const beatLen = Math.floor(notBars / beats(1));
    const notBeats = notBars - beats(beatLen);

    progressCallback(`${barLen}.${beatLen}.${notBeats}`);
  });

  finishPromise.then(() => clearInterval(stopInterval));
  
  return finishPromise;
}