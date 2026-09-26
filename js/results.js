export const latestDraw = {
  "round": 1243,
  "date": "2026.09.26",
  "numbers": [
    9,
    18,
    24,
    38,
    43,
    44
  ],
  "bonus": 35,
  "source": "https://www.dhlottery.co.kr/lt645/result?ltEpsd=1243"
};

export function compareNumbers(numbers, draw = latestDraw) {
  const matches = numbers.filter(number => draw.numbers.includes(number));
  return { count: matches.length, bonus: numbers.includes(draw.bonus), matches };
}
