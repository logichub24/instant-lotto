export const latestDraw = {
  "round": 1242,
  "date": "2026.09.19",
  "numbers": [
    2,
    4,
    10,
    16,
    31,
    41
  ],
  "bonus": 9,
  "source": "https://www.dhlottery.co.kr/lt645/result?ltEpsd=1242"
};

export function compareNumbers(numbers, draw = latestDraw) {
  const matches = numbers.filter(number => draw.numbers.includes(number));
  return { count: matches.length, bonus: numbers.includes(draw.bonus), matches };
}
