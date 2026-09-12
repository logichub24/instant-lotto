export const latestDraw = {
  "round": 1241,
  "date": "2026.09.12",
  "numbers": [
    7,
    13,
    16,
    23,
    24,
    43
  ],
  "bonus": 9,
  "source": "https://www.dhlottery.co.kr/lt645/result?ltEpsd=1241"
};

export function compareNumbers(numbers, draw = latestDraw) {
  const matches = numbers.filter(number => draw.numbers.includes(number));
  return { count: matches.length, bonus: numbers.includes(draw.bonus), matches };
}
