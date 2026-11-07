export const latestDraw = {
  "round": 1249,
  "date": "2026.11.07",
  "numbers": [
    2,
    11,
    16,
    25,
    34,
    35
  ],
  "bonus": 14,
  "source": "https://www.dhlottery.co.kr/lt645/result?ltEpsd=1249"
};

export function compareNumbers(numbers, draw = latestDraw) {
  const matches = numbers.filter(number => draw.numbers.includes(number));
  return { count: matches.length, bonus: numbers.includes(draw.bonus), matches };
}
