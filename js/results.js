export const latestDraw = {
  "round": 1248,
  "date": "2026.10.31",
  "numbers": [
    16,
    18,
    27,
    36,
    38,
    42
  ],
  "bonus": 22,
  "source": "https://www.dhlottery.co.kr/lt645/result?ltEpsd=1248"
};

export function compareNumbers(numbers, draw = latestDraw) {
  const matches = numbers.filter(number => draw.numbers.includes(number));
  return { count: matches.length, bonus: numbers.includes(draw.bonus), matches };
}
