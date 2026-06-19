// Generates a 1200x630 (Open Graph standard) PNG share card for the site.
// Amber + parchment palette, includes ministry name, tagline, and verse.

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

export const buildShareCard = () => {
  const w = 1200;
  const h = 630;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Parchment gradient background
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#ecdcad');
  bg.addColorStop(0.5, '#f4e5b8');
  bg.addColorStop(1, '#dfca94');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle decorative corner glows
  const glow1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 400);
  glow1.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
  glow1.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, 600, 600);

  const glow2 = ctx.createRadialGradient(w, h, 0, w, h, 500);
  glow2.addColorStop(0, 'rgba(180, 83, 9, 0.3)');
  glow2.addColorStop(1, 'rgba(180, 83, 9, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(w - 700, h - 700, 700, 700);

  // Border frame
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.6)';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, w - 60, h - 60);
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 50, w - 100, h - 100);

  // Eyebrow label
  ctx.fillStyle = '#92400e';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('RANDOM BLESSINGS  •  ETERNAL IMPACT', w / 2, 130);

  // Ministry title
  ctx.fillStyle = '#3a1d04';
  ctx.font = 'bold 78px Georgia, serif';
  ctx.fillText('tryHimandsee', w / 2, 230);
  ctx.fillStyle = '#92400e';
  ctx.font = 'italic 42px Georgia, serif';
  ctx.fillText('ministries', w / 2, 285);

  // Divider
  ctx.fillStyle = 'rgba(180, 83, 9, 0.5)';
  ctx.fillRect(w / 2 - 90, 315, 180, 3);

  // Tagline
  ctx.fillStyle = '#5b2807';
  ctx.font = '28px Georgia, serif';
  ctx.textAlign = 'center';
  const tagline = 'Encouraging encounters with Christ — serving Richmond & Henrico through food, clothing, and Monthly Miracle Runs.';
  const lines = wrap(ctx, tagline, w - 200);
  let y = 380;
  for (const line of lines) {
    ctx.fillText(line, w / 2, y);
    y += 38;
  }

  // Scripture / call
  ctx.fillStyle = '#92400e';
  ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText('"Freely ye have received, freely give." — Matthew 10:8', w / 2, y + 30);

  // URL footer
  ctx.fillStyle = '#3a1d04';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.fillText('tryhimandseeministries.org', w / 2, h - 70);

  return canvas;
};

const canvasToBlob = (canvas) =>
  new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

export const downloadShareCard = async () => {
  const canvas = buildShareCard();
  const blob = await canvasToBlob(canvas);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'tryhimandsee-share.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
};

export const shareCardNative = async (text) => {
  const canvas = buildShareCard();
  const blob = await canvasToBlob(canvas);
  const file = new File([blob], 'tryhimandsee-share.png', { type: 'image/png' });
  if (
    navigator.canShare &&
    navigator.canShare({ files: [file] }) &&
    navigator.share
  ) {
    await navigator.share({
      title: 'tryHimandsee ministries',
      text,
      url: 'https://tryhimandseeministries.org',
      files: [file],
    });
    return 'shared';
  }
  return 'unsupported';
};
