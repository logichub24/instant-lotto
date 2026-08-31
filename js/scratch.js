const BRUSH_SIZE = 36;

export function createScratchCard({ canvas, zone, onStart, onScratch, onReveal }) {
  let context;
  let drawing = false;
  let points = 0;
  let lastTargetCheckAt = 0;
  let lastPoint;
  let revealed = false;

  function reset() {
    const width = zone.clientWidth;
    const height = zone.clientHeight;
    if (!width || !height) return requestAnimationFrame(reset);
    const dpr = devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context = canvas.getContext('2d', { willReadFrequently: true });
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.globalCompositeOperation = 'source-over';
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(.18, '#aeb8c4');
    gradient.addColorStop(.42, '#eef2f7');
    gradient.addColorStop(.66, '#98a4b3');
    gradient.addColorStop(1, '#d9e0e8');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    const reflection = context.createLinearGradient(0, 0, width, height);
    reflection.addColorStop(.18, 'rgba(255,255,255,0)');
    reflection.addColorStop(.38, 'rgba(255,255,255,.08)');
    reflection.addColorStop(.5, 'rgba(255,255,255,.68)');
    reflection.addColorStop(.62, 'rgba(255,255,255,.08)');
    reflection.addColorStop(.8, 'rgba(255,255,255,0)');
    context.fillStyle = reflection;
    context.fillRect(0, 0, width, height);
    context.fillStyle = 'rgba(255,255,255,.25)';
    for (let i = 0; i < width * height * .015; i++) {
      const size = Math.random() * 1.4 + .25;
      context.fillRect(Math.random() * width, Math.random() * height, size, size);
    }
    context.strokeStyle = 'rgba(255,255,255,.24)';
    context.lineWidth = 1;
    for (let x = -height; x < width; x += 18) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x + height, height);
      context.stroke();
    }
    context.fillStyle = '#334155';
    context.font = `bold ${Math.max(16, Math.min(20, width * .06))}px Noto Sans KR`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('이곳을 긁어보세요', width / 2, height / 2 - 16);
    context.fillStyle = '#f7b916';
    context.beginPath();
    context.arc(width / 2, height / 2 + 30, 16, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#fff0a4';
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = '#8b5e00';
    context.font = 'bold 17px sans-serif';
    context.fillText('₩', width / 2, height / 2 + 31);
    canvas.style.opacity = '1';
    canvas.style.pointerEvents = 'auto';
    zone.classList.add('is-shining');
    points = 0;
    lastTargetCheckAt = 0;
    revealed = false;
  }

  function point(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function erase(from, to) {
    context.globalCompositeOperation = 'destination-out';
    context.lineCap = context.lineJoin = 'round';
    context.lineWidth = BRUSH_SIZE;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  }

  function revealIfReady() {
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let erased = 0;
    for (let i = 3; i < pixels.length; i += 16) erased += pixels[i] === 0;
    if (erased / (pixels.length / 16) >= .65) reveal();
  }

  function allNumbersReadable() {
    const canvasRect = canvas.getBoundingClientRect();
    const dpr = devicePixelRatio || 1;
    return [...zone.querySelectorAll('.lotto-ball')].every(target => {
      const rect = target.getBoundingClientRect();
      const centerX = rect.left - canvasRect.left + rect.width / 2;
      const centerY = rect.top - canvasRect.top + rect.height / 2;
      return [-8, 0, 8].filter(offset => {
        const pixel = context.getImageData(Math.round((centerX + offset) * dpr), Math.round(centerY * dpr), 1, 1).data;
        return pixel[3] === 0;
      }).length >= 2;
    });
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    drawing = false;
    canvas.style.opacity = '0';
    canvas.style.pointerEvents = 'none';
    onReveal();
  }

  canvas.addEventListener('pointerdown', event => {
    if (revealed || !context) return;
    drawing = true;
    zone.classList.remove('is-shining');
    onStart?.();
    lastPoint = point(event);
    canvas.setPointerCapture(event.pointerId);
    erase(lastPoint, lastPoint);
  });
  canvas.addEventListener('pointermove', event => {
    if (!drawing) return;
    const nextPoint = point(event);
    erase(lastPoint, nextPoint);
    onScratch?.();
    lastPoint = nextPoint;
    if (performance.now() - lastTargetCheckAt > 90) {
      lastTargetCheckAt = performance.now();
      if (allNumbersReadable()) return reveal();
    }
    if (++points % 30 === 0) revealIfReady();
  });
  canvas.addEventListener('pointerup', () => { drawing = false; });
  canvas.addEventListener('pointercancel', () => { drawing = false; });

  const resizeObserver = new ResizeObserver(() => {
    if (!drawing && !revealed) reset();
  });
  resizeObserver.observe(zone);

  return { reset, reveal };
}
