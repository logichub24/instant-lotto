export const latestDraw = {
  "round": 1239,
  "date": "2026.08.29",
  "numbers": [
    11,
    13,
    22,
    32,
    33,
    36
  ],
  "bonus": 8,
  "source": "https://www.dhlottery.co.kr/lt645/result?ltEpsd=1239"
};

export function compareNumbers(numbers, draw = latestDraw) {
  const matches = numbers.filter(number => draw.numbers.includes(number));
  return { count: matches.length, bonus: numbers.includes(draw.bonus), matches };
}
