const COLORS = ['#fff200', '#ff6b35', '#ff3b8d', '#4ecbff', '#8dfc74', '#ffffff'];

export function celebrate(ticket) {
  ticket.classList.remove('celebrating');
  void ticket.offsetWidth;
  ticket.classList.add('celebrating');
  const rect = ticket.getBoundingClientRect();
  for (let i = 0; i < 44; i++) {
    const piece = document.createElement('i');
    const angle = (Math.PI * 2 * i) / 44 + (Math.random() - .5) * .18;
    const distance = 80 + Math.random() * 110;
    const originX = rect.width / 2 + (Math.random() - .5) * 36;
    const originY = rect.height * .46 + (Math.random() - .5) * 28;
    piece.className = 'celebration-confetti';
    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;
    piece.style.background = piece.style.color = COLORS[i % COLORS.length];
    ticket.append(piece);
    piece.animate([
      { transform: 'translate(-50%, -50%) scale(.2) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance + 70}px)) scale(.75) rotate(${360 + Math.random() * 360}deg)`, opacity: 0 }
    ], { duration: 850 + Math.random() * 350, easing: 'cubic-bezier(.12,.72,.25,1)' }).onfinish = () => piece.remove();
  }
}
