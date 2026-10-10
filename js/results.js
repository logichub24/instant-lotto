export const latestDraw = {
  "round": 1245,
  "date": "2026.10.10",
  "numbers": [
    4,
    5,
    25,
    28,
    32,
    42
  ],
  "bonus": 12,
  "source": "https://www.dhlottery.co.kr/lt645/result?ltEpsd=1245"
};

export function compareNumbers(numbers, draw = latestDraw) {
  const matches = numbers.filter(number => draw.numbers.includes(number));
  return { count: matches.length, bonus: numbers.includes(draw.bonus), matches };
}
