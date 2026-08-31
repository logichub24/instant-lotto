const KEY = 'lotto_saved_tickets';

export function loadTickets() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(value) ? value.filter(isTicket) : [];
  } catch {
    return [];
  }
}

export function saveTicket(ticket) {
  const tickets = loadTickets();
  if (tickets.some(saved => saved.id === ticket.id)) return false;
  localStorage.setItem(KEY, JSON.stringify([{ ...ticket, saved: true, savedAt: new Date().toISOString() }, ...tickets]));
  return true;
}

export function removeTicket(id) {
  localStorage.setItem(KEY, JSON.stringify(loadTickets().filter(ticket => ticket.id !== id)));
}

export function clearTickets() {
  localStorage.removeItem(KEY);
}

function isTicket(ticket) {
  return ticket && typeof ticket.id === 'string' && Array.isArray(ticket.numbers) && ticket.numbers.length === 6
    && ticket.numbers.every(number => Number.isInteger(number) && number >= 1 && number <= 45);
}
