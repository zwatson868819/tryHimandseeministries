// Generates a 1080×1080 PNG quote card for a verse and shares/downloads it.
// Uses Web Share Level 2 (with files) when available, otherwise downloads
// the image and copies the verse text to the clipboard.

const APP_URL =
  (typeof window !== 'undefined' && window.location?.origin) ||
  'https://tryhimandseeministries.org';

const wrap = (ctx, text, maxWidth) => {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
};

const buildQuoteCard = (verse) => {
  const size = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Background gradient (slate-950 → amber-900 → slate-950)
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#020617');
  bg.addColorStop(0.5, '#451a03');
  bg.addColorStop(1, '#020617');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Outer border
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, size - 80, size - 80);

  // Top label
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('VERSE OF THE DAY', size / 2, 140);

  // Decorative divider
  ctx.fillStyle = 'rgba(245, 158, 11, 0.6)';
  ctx.fillRect(size / 2 - 60, 165, 120, 2);

  // Quote text
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'italic 54px Georgia, serif';
  ctx.textAlign = 'center';
  const lines = wrap(ctx, `"${verse.text}"`, size - 200);
  const lineHeight = 72;
  const blockHeight = lines.length * lineHeight;
  let y = (size - blockHeight) / 2;
  for (const line of lines) {
    ctx.fillText(line, size / 2, y);
    y += lineHeight;
  }

  // Reference
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 42px Georgia, serif';
  ctx.fillText(`- ${verse.ref}`, size / 2, y + 80);

  // Footer / branding
  ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText('tryHimandsee ministries', size / 2, size - 110);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
  ctx.font = '22px Georgia, serif';
  ctx.fillText('tryhimandseeministries.org', size / 2, size - 75);

  return canvas;
};

const canvasToBlob = (canvas) =>
  new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

export const shareVerse = async (verse) => {
  const text = `"${verse.text}" - ${verse.ref}\n\nVerse of the Day from tryHimandsee ministries`;
  const url = APP_URL;
  const canvas = buildQuoteCard(verse);
  const blob = await canvasToBlob(canvas);
  const file = new File([blob], 'verse-of-the-day.png', { type: 'image/png' });

  // Best path: Web Share Level 2 (mobile + recent desktop browsers)
  if (
    navigator.canShare &&
    navigator.canShare({ files: [file] }) &&
    navigator.share
  ) {
    try {
      await navigator.share({ title: 'Verse of the Day', text, url, files: [file] });
      return { method: 'shared' };
    } catch (e) {
      if (e?.name === 'AbortError') return { method: 'cancelled' };
      // fall through to fallback
    }
  }

  // Fallback path: copy text + download the image
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(`${text}\n${url}`);
    }
  } catch {
    // ignore - clipboard may be blocked in some contexts
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'verse-of-the-day.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  return { method: 'downloaded' };
};
