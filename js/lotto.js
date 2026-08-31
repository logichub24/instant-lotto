export function createTicket() {
  const createdAt = new Date();
  return {
    id: crypto.randomUUID(),
    numbers: generateNumbers(),
    createdAt: createdAt.toISOString(),
    drawRound: drawRoundForDate(createdAt),
    completed: false,
    saved: false
  };
}

export function drawRoundForDate(date) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  let daysUntilSaturday = (6 - kst.getUTCDay() + 7) % 7;
  if (daysUntilSaturday === 0 && (kst.getUTCHours() > 20 || (kst.getUTCHours() === 20 && kst.getUTCMinutes() >= 35))) daysUntilSaturday = 7;
  const drawDate = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() + daysUntilSaturday);
  return Math.floor((drawDate - Date.UTC(2002, 11, 7)) / 604800000) + 1;
}

export function generateNumbers() {
  const numbers = new Set();
  const random = new Uint8Array(1);
  while (numbers.size < 6) {
    crypto.getRandomValues(random);
    if (random[0] < 225) numbers.add(random[0] % 45 + 1);
  }
  return [...numbers].sort((a, b) => a - b);
}

export function ballClass(number) {
  return `ball-${Math.min(5, Math.ceil(number / 10))}`;
}
