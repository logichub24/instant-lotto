import { createTicket, drawRoundForDate } from './lotto.js';
import { createScratchCard } from './scratch.js?v=6';
import { createSoundEffects } from './sound.js?v=2';
import { celebrate } from './celebration.js';
import { compareNumbers, latestDraw } from './results.js';
import { clearTickets, loadTickets, removeTicket, saveTicket } from './storage.js';
import { ball, formatDate, setVisible } from './ui.js';

const $ = id => document.getElementById(id);
const MAX_SAVED_TICKETS = 50;
const state = { view: 'lottery', ticket: null, status: 'NEW_TICKET' };
const dom = {
  views: Object.fromEntries(['lottery', 'saved', 'results', 'info'].map(name => [name, $(`view-${name}`)])),
  nav: document.querySelectorAll('.nav-btn'), main: document.querySelector('main'), header: $('header-desc'),
  ticket: $('ticket-container'), grid: $('numbers-grid'), save: $('btn-save'), saveIcon: $('save-icon'), saveText: $('save-text'),
  actions: $('action-buttons'), revealMessage: $('reveal-message'), savedList: $('saved-list'), savedEmpty: $('saved-empty'), savedLimitMessage: $('saved-limit-message'), deleteAll: $('btn-delete-all'),
  resultRound: $('result-round'), resultDate: $('result-date'), resultNumbers: $('result-numbers'), resultBonus: $('result-bonus'), resultSummary: $('result-summary'), resultList: $('result-list'),
  modal: $('confirm-modal'), modalContent: $('confirm-modal-content'), modalMessage: $('confirm-message'), toast: $('toast-message')
};

const sound = createSoundEffects();
const scratch = createScratchCard({ canvas: $('scratch-canvas'), zone: $('scratch-zone'), onStart: startScratch, onScratch: sound.scratch, onReveal: revealTicket });
let toastTimer;
let confirmAction;

function logEvent(name, params = {}) { console.info(`[Analytics] ${name}`, params); }

function issueTicket() {
  state.status = 'READY';
  state.ticket = { ...createTicket(), revealed: false };
  dom.grid.replaceChildren(...state.ticket.numbers.map(number => ball(number, 'lotto-ball')));
  setSaveButton(false);
  dom.actions.classList.add('mt-0', 'max-h-0', 'overflow-hidden', 'opacity-0', 'pointer-events-none', 'translate-y-4');
  dom.actions.classList.remove('mt-4', 'max-h-96', 'opacity-100', 'translate-y-0');
  dom.revealMessage.classList.add('hidden');
  dom.ticket.classList.remove('pop-in');
  void dom.ticket.offsetWidth;
  dom.ticket.classList.add('pop-in');
  scratch.reset();
  setTimeout(() => { if (state.status === 'READY') scratch.reset(); }, 300);
  logEvent('ticket_issued', { ticket_id: state.ticket.id });
}

function startScratch() {
  if (state.status !== 'READY') return;
  state.status = 'SCRATCHING';
  navigator.vibrate?.(10);
  logEvent('scratch_started', { ticket_id: state.ticket.id });
}

function revealTicket() {
  state.status = 'REVEALED';
  state.ticket.revealed = true;
  state.ticket.completed = true;
  sound.reveal();
  celebrate(dom.ticket);
  [...dom.grid.children].forEach(ball => ball.classList.add('lotto-ball--revealed'));
  navigator.vibrate?.(20);
  logEvent('scratch_completed', { ticket_id: state.ticket.id });
  setTimeout(() => {
    dom.actions.classList.remove('mt-0', 'max-h-0', 'overflow-hidden', 'opacity-0', 'pointer-events-none', 'translate-y-4');
    dom.actions.classList.add('mt-4', 'max-h-96', 'opacity-100', 'translate-y-0');
    dom.revealMessage.classList.remove('hidden');
  }, 500);
}

function setSaveButton(saved) {
  dom.save.classList.toggle('pointer-events-none', saved);
  dom.save.classList.toggle('bg-gray-100', saved);
  dom.save.classList.toggle('text-gray-500', saved);
  dom.save.classList.toggle('border-gray-200', saved);
  dom.save.classList.toggle('border-orange-400', !saved);
  dom.save.classList.toggle('text-orange-500', !saved);
  dom.save.classList.toggle('bg-white', !saved);
  dom.save.classList.toggle('hover:bg-orange-50', !saved);
  dom.saveIcon.className = saved ? 'fa-solid fa-heart text-red-400' : 'fa-regular fa-heart';
  dom.saveText.textContent = saved ? '저장됨' : '번호 저장';
}

function saveCurrentTicket() {
  if (!state.ticket?.revealed || state.ticket.saved) return;
  if (!saveTicket(state.ticket)) return;
  state.ticket.saved = true;
  setSaveButton(true);
  logEvent('number_saved', { ticket_id: state.ticket.id });
  toast('번호가 저장되었습니다.');
}

function renderSavedTickets() {
  const tickets = loadTickets();
  const visibleTickets = tickets.slice(0, MAX_SAVED_TICKETS);
  dom.savedList.replaceChildren();
  setVisible(dom.savedEmpty, tickets.length === 0);
  setVisible(dom.savedLimitMessage, tickets.length > MAX_SAVED_TICKETS, 'block');
  dom.deleteAll.classList.toggle('hidden', tickets.length === 0);
  visibleTickets.forEach(ticket => {
    const round = ticket.drawRound ?? drawRoundForDate(new Date(ticket.createdAt || ticket.savedAt));
    const item = document.createElement('article');
    item.className = 'bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-1 scratch-bg-pattern';
    const top = document.createElement('div');
    top.className = 'flex justify-between items-center text-xs font-bold text-gray-600 bg-white/80 px-1 rounded';
    const date = document.createElement('span');
    date.textContent = `저장일시: ${formatDate(ticket.savedAt)} · 제${round}회`;
    const remove = document.createElement('button');
    remove.className = 'text-red-500 hover:text-red-600 transition-colors p-2 -mr-1';
    remove.setAttribute('aria-label', '저장 번호 삭제');
    remove.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    remove.onclick = () => {
      removeTicket(ticket.id);
      if (state.ticket?.id === ticket.id) { state.ticket.saved = false; setSaveButton(false); }
      renderSavedTickets();
      toast('삭제되었습니다.');
    };
    top.append(date, remove);
    const numbers = document.createElement('div');
    numbers.className = 'flex justify-between items-center px-1';
    numbers.append(...ticket.numbers.map(number => ball(number)));
    item.append(top, numbers);
    dom.savedList.append(item);
  });
}

function renderResults() {
  dom.resultRound.textContent = `제${latestDraw.round}회`;
  dom.resultDate.textContent = `${latestDraw.date} 추첨`;
  dom.resultNumbers.replaceChildren(...latestDraw.numbers.map(number => ball(number, 'w-10 h-10 text-sm')));
  dom.resultBonus.replaceChildren(ball(latestDraw.bonus, 'w-10 h-10 text-sm'));
  const tickets = loadTickets();
  const visibleTickets = tickets.slice(0, MAX_SAVED_TICKETS);
  dom.resultSummary.textContent = tickets.length ? `저장한 ${tickets.length}개 번호를 이번 회차와 비교했어요.${tickets.length > MAX_SAVED_TICKETS ? ' 최근 50개만 표시합니다.' : ''}` : '저장한 번호가 없어요.';
  dom.resultList.replaceChildren(...visibleTickets.map(ticket => {
    const round = ticket.drawRound ?? drawRoundForDate(new Date(ticket.createdAt || ticket.savedAt));
    const compared = round === latestDraw.round ? compareNumbers(ticket.numbers) : null;
    const item = document.createElement('article');
    item.className = 'bg-white rounded-xl border border-gray-100 p-2 shadow-sm';
    const title = document.createElement('p');
    title.className = 'text-sm font-bold text-gray-700';
    title.textContent = compared ? `번호 ${compared.count}개 일치${compared.bonus ? ' · 보너스 일치' : ''}` : `제${round}회 추첨 전`;
    const numbers = document.createElement('div');
    numbers.className = 'flex items-center justify-between gap-2 mt-1';
    numbers.append(...ticket.numbers.map(number => {
      const element = ball(number, 'w-8 h-8 text-xs');
      if (compared?.matches.includes(number)) element.classList.add('ring-2', 'ring-orange-400', 'ring-offset-2');
      if (compared && number === latestDraw.bonus) element.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2');
      return element;
    }));
    const outcome = document.createElement('span');
    const result = compared ? drawResultLabel(compared) : '추첨 전';
    outcome.className = result === '낙첨' ? 'shrink-0 text-sm font-black text-red-500' : result === '추첨 전' ? 'shrink-0 text-sm font-black text-gray-700' : 'shrink-0 text-sm font-black text-green-700';
    outcome.textContent = result;
    numbers.append(outcome);
    item.append(title, numbers);
    return item;
  }));
}

function drawResultLabel({ count, bonus }) {
  if (count === 6) return '1등 당첨';
  if (count === 5 && bonus) return '2등 당첨';
  if (count === 5) return '3등 당첨';
  if (count === 4) return '4등 당첨';
  if (count === 3) return '5등 당첨';
  return '낙첨';
}

function switchTab(view) {
  if (view === state.view) return;
  setTab(view);
}

function setTab(view) {
  state.view = view;
  dom.nav.forEach(button => {
    const active = button.dataset.target === view;
    button.classList.toggle('text-orange-500', active); button.classList.toggle('font-bold', active); button.classList.toggle('border-orange-500', active);
    button.classList.toggle('text-gray-400', !active); button.classList.toggle('font-normal', !active); button.classList.toggle('border-transparent', !active);
  });
  Object.entries(dom.views).forEach(([name, element]) => element.classList.toggle('hidden', name !== view));
  dom.header.textContent = { lottery: '긁어서 오늘의 번호를 확인하세요', saved: '행운이 깃든 내 번호들', results: '이번 주 공식 추첨 결과', info: '서비스 이용 안내' }[view];
  if (view === 'saved') renderSavedTickets();
  if (view === 'results') renderResults();
  dom.main.scrollTo(0, 0);
}

function toast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.replace('opacity-0', 'opacity-100'); dom.toast.classList.replace('translate-y-[-20px]', 'translate-y-0');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { dom.toast.classList.replace('opacity-100', 'opacity-0'); dom.toast.classList.replace('translate-y-0', 'translate-y-[-20px]'); }, 2500);
}

function confirm(message, action) {
  confirmAction = action; dom.modalMessage.textContent = message;
  dom.modal.classList.remove('hidden'); void dom.modal.offsetWidth; dom.modal.classList.remove('opacity-0'); dom.modalContent.classList.remove('scale-95');
}
function closeConfirm() { dom.modal.classList.add('opacity-0'); dom.modalContent.classList.add('scale-95'); setTimeout(() => dom.modal.classList.add('hidden'), 200); }

document.querySelectorAll('[data-target]').forEach(button => button.addEventListener('click', () => switchTab(button.dataset.target)));
document.addEventListener('click', event => { if (event.target.closest('button')) sound.click(); });
dom.save.addEventListener('click', saveCurrentTicket);
$('btn-new').addEventListener('click', () => { logEvent('new_ticket_clicked'); issueTicket(); });
$('btn-reveal').addEventListener('click', () => { if (state.status === 'READY' || state.status === 'SCRATCHING') scratch.reveal(); });
dom.deleteAll.addEventListener('click', () => confirm('저장된 번호를 모두 삭제할까요?', () => { clearTickets(); state.ticket.saved = false; setSaveButton(false); renderSavedTickets(); toast('모두 삭제되었습니다.'); }));
$('btn-confirm-cancel').addEventListener('click', closeConfirm);
$('btn-confirm-ok').addEventListener('click', () => { confirmAction?.(); closeConfirm(); });
window.addEventListener('resize', () => { if (state.view === 'lottery' && !state.ticket?.revealed) scratch.reset(); });
issueTicket();
