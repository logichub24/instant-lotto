import { ballClass } from './lotto.js';

export function ball(number, size = 'w-9 h-9 text-sm') {
  const element = document.createElement('div');
  element.className = `${size} rounded-full flex items-center justify-center text-white font-bold shadow-sm ${ballClass(number)}`;
  element.textContent = number;
  return element;
}

export function formatDate(iso) {
  const date = new Date(iso);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function setVisible(element, visible, display = 'flex') {
  element.classList.toggle('hidden', !visible);
  element.classList.toggle(display, visible);
}
