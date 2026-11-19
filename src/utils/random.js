// Randomness for the reward spinners, drawn from the browser's CSPRNG.
// In production the server should draw the prize; the spinners only animate to it.

/** Uniform float in [0, 1). */
export function random() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 4294967296;
}

/** Uniform integer in [min, max], both inclusive. */
export const randomInt = (min, max) => min + Math.floor(random() * (max - min + 1));

export const pickOne = (list) => list[randomInt(0, list.length - 1)];

/** Index of an item picked with probability proportional to its `weight`. */
export function pickWeighted(list) {
  const total = list.reduce((sum, item) => sum + item.weight, 0);
  let r = random() * total;
  for (let i = 0; i < list.length; i++) {
    r -= list[i].weight;
    if (r < 0) return i;
  }
  return list.length - 1;
}
