export const latestDraw = {
  "round": 1240,
  "date": "2026.09.05",
  "numbers": [
    11,
    13,
    19,
    20,
    31,
    44
  ],
  "bonus": 27,
  "source": "https://www.dhlottery.co.kr/lt645/result?ltEpsd=1240"
};

export function compareNumbers(numbers, draw = latestDraw) {
  const matches = numbers.filter(number => draw.numbers.includes(number));
  return { count: matches.length, bonus: numbers.includes(draw.bonus), matches };
}
