export function createTicket() {
  return {
    id: crypto.randomUUID(),
    numbers: generateNumbers(),
    createdAt: new Date().toISOString(),
    completed: false,
    saved: false
  };
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
