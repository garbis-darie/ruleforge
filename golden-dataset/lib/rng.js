export function createRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function intBetween(rand, min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function pickWeighted(rand, weightedItems) {
  const total = weightedItems.reduce((sum, item) => sum + item.weight, 0);
  const roll = rand() * total;
  let acc = 0;
  for (const item of weightedItems) {
    acc += item.weight;
    if (roll <= acc) return item.value;
  }
  return weightedItems[weightedItems.length - 1].value;
}
