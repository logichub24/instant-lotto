export const latestDraw = {
  "round": 1244,
  "date": "2026.10.03",
  "numbers": [
    1,
    13,
    18,
    26,
    34,
    38
  ],
  "bonus": 25,
  "source": "https://www.dhlottery.co.kr/lt645/result?ltEpsd=1244"
};

export function compareNumbers(numbers, draw = latestDraw) {
  const matches = numbers.filter(number => draw.numbers.includes(number));
  return { count: matches.length, bonus: numbers.includes(draw.bonus), matches };
}
