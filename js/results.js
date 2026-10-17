export const latestDraw = {
  "round": 1246,
  "date": "2026.10.17",
  "numbers": [
    16,
    22,
    23,
    24,
    27,
    28
  ],
  "bonus": 6,
  "source": "https://www.dhlottery.co.kr/lt645/result?ltEpsd=1246"
};

export function compareNumbers(numbers, draw = latestDraw) {
  const matches = numbers.filter(number => draw.numbers.includes(number));
  return { count: matches.length, bonus: numbers.includes(draw.bonus), matches };
}
