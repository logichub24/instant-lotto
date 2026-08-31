import { readFile, writeFile } from 'node:fs/promises';

const RESULT_FILE = new URL('../js/results.js', import.meta.url);
const HISTORY_FILE = new URL('../data/draw-history.json', import.meta.url);
const FIRST_DRAW = Date.UTC(2002, 11, 7);

const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
const round = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - FIRST_DRAW) / 604800000) + 1;
const source = `https://www.dhlottery.co.kr/lt645/result?ltEpsd=${round}`;
const endpoint = `https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do?srchDir=center&srchLtEpsd=${round}`;
const response = await fetch(endpoint, { headers: { 'User-Agent': 'instant-lotto-results-updater/1.0' } });
if (!response.ok) throw new Error(`결과 요청 실패: ${response.status}`);
const payload = await response.json();
const draw = payload?.data?.list?.find(item => Number(item.ltEpsd) === round);
const numbers = draw && [draw.tm1WnNo, draw.tm2WnNo, draw.tm3WnNo, draw.tm4WnNo, draw.tm5WnNo, draw.tm6WnNo].map(Number);
const bonus = Number(draw?.bnsWnNo);
if (!numbers || new Set(numbers).size !== 6 || numbers.some(number => number < 1 || number > 45) || bonus < 1 || bonus > 45) {
  throw new Error(`${round}회 공식 결과가 아직 준비되지 않았습니다.`);
}

const date = String(draw.ltRflYmd).replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3');
const latest = { round, date, numbers, bonus, source };
const moduleSource = `export const latestDraw = ${JSON.stringify(latest, null, 2)};\n\nexport function compareNumbers(numbers, draw = latestDraw) {\n  const matches = numbers.filter(number => draw.numbers.includes(number));\n  return { count: matches.length, bonus: numbers.includes(draw.bonus), matches };\n}\n`;
const history = JSON.parse(await readFile(HISTORY_FILE, 'utf8'));
const nextHistory = [...history.filter(item => item.round !== round), latest].sort((a, b) => a.round - b.round);
await Promise.all([writeFile(RESULT_FILE, moduleSource), writeFile(HISTORY_FILE, `${JSON.stringify(nextHistory, null, 2)}\n`)]);
console.log(`제${round}회 결과를 갱신했습니다.`);
