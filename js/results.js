export const latestDraw = {
  "round": 1247,
  "date": "2026.10.24",
  "numbers": [
    8,
    14,
    21,
    22,
    42,
    45
  ],
  "bonus": 24,
  "source": "https://www.dhlottery.co.kr/lt645/result?ltEpsd=1247"
};

export function compareNumbers(numbers, draw = latestDraw) {
  const matches = numbers.filter(number => draw.numbers.includes(number));
  return { count: matches.length, bonus: numbers.includes(draw.bonus), matches };
}
