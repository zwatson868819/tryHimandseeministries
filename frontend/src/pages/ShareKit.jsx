import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Download, Share2, MessageCircle, Mail, Facebook, Instagram, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { buildShareCard, downloadShareCard, shareCardNative } from '../lib/shareKit';

const SITE = 'https://tryhimandseeministries.org';

const SNIPPETS = {
  sms: {
    label: 'Text message (SMS)',
    Icon: MessageCircle,
    text: `Hey, wanted to share something close to my heart. I'm part of tryHimandsee ministries, serving Richmond & Henrico through food, clothing, and Monthly Miracle Runs. Take a look: ${SITE}`,
    accent: 'from-green-500/20 to-green-600/10 border-green-500/30',
  },
  email: {
    label: 'Email to friends & family',
    Icon: Mail,
    text: `Hi friend,

I wanted to share a ministry that's been on my heart, tryHimandsee ministries. We serve the poor and underserved in Richmond and Henrico through food, clothing, hygiene kits, and Monthly Miracle Runs where we go out to bless people with whatever the Lord lays on our hearts that day, a meal, prayer, a gift card, encouragement.

Our heart is simple: freely we have received, freely we give (Matthew 10:8).

If this resonates with you, I'd love for you to take a look. You can volunteer, donate (one-time or monthly), light a candle of prayer, or just spread the word.

${SITE}

Grace and peace,`,
    accent: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  },
  facebook: {
    label: 'Facebook post',
    Icon: Facebook,
    text: `Friends, I want to share something close to my heart.

tryHimandsee ministries is an outreach in Richmond & Henrico, we serve the underserved with food (The PEW Pantry), clothing (Garments of Grace), hygiene kits (Kingdom Care), and Monthly Miracle Runs where we step out and bless strangers however the Lord leads.

If you've ever wanted to make a small but eternal difference, join us, donate, or even just light a candle of prayer on our wall.

"Freely ye have received, freely give.", Matthew 10:8

${SITE}

#tryHimandsee #RichmondVA #HenricoVA #MonthlyMiracleRun #FaithInAction`,
    accent: 'from-blue-600/20 to-indigo-600/10 border-blue-500/30',
  },
  instagram: {
    label: 'Instagram caption',
    Icon: Instagram,
    text: `Random blessings. Eternal impact. ✨

tryHimandsee ministries, Richmond & Henrico outreach serving food, clothing, hygiene kits, and Monthly Miracle Runs.

"Freely ye have received, freely give.", Matthew 10:8 🕊️

Link in bio → ${SITE}

#tryHimandsee #RichmondVA #HenricoVA #MonthlyMiracleRun #FaithInAction #ChristianCommunity #FreelyGive #BlessingOnPurpose`,
    accent: 'from-pink-500/20 to-purple-500/10 border-pink-500/30',
  },
};

const SnippetCard = ({ k, snippet }) => {
  const [copied, setCopied] = useState(false);
  const { label, Icon, text, accent } = snippet;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied to your clipboard`);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      toast.error('Could not copy. Long-press to copy manually.');
    }
  };

  return (
    <div
      data-testid={`snippet-${k}`}
      className={`bg-gradient-to-br ${accent} bg-slate-900 border rounded-xl p-5`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Icon size={18} className="text-amber-400" />
          <span>{label}</span>
        </div>
        <button
          type="button"
          onClick={copy}
          data-testid={`copy-${k}`}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-900'
          }`}
        >
          {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
        </button>
      </div>
      <pre className="whitespace-pre-wrap text-slate-200 text-sm leading-relaxed font-sans">
        {text}
      </pre>
    </div>
  );
};

const ShareKit = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Render preview into the visible canvas slot
    if (!canvasRef.current) return;
    const src = buildShareCard();
    const dst = canvasRef.current;
    const ctx = dst.getContext('2d');
    dst.width = src.width;
    dst.height = src.height;
    ctx.drawImage(src, 0, 0);
  }, []);

  const handleNativeShare = async () => {
    try {
      const result = await shareCardNative(
        `Random blessings, eternal impact. tryHimandsee ministries, Richmond & Henrico. ${SITE}`
      );
      if (result === 'unsupported') {
        await downloadShareCard();
        toast.success('Image downloaded. Attach it to your post!');
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        toast.error('Could not open the share dialog.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative pt-32 pb-12 bg-gradient-to-b from-amber-950/30 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Spread the word
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Share the <span className="text-amber-400">Mission</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
            One evening of sharing can grow our community for years. Below is a ready-made share kit , a branded image plus pre-written posts for SMS, email, Facebook, and Instagram. Tap, copy, send.
          </p>
        </div>
      </section>

      {/* Image preview */}
      <section className="py-10 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4 text-white font-semibold">
              <ImageIcon size={20} className="text-amber-400" />
              <h2 className="text-xl">Share image preview</h2>
            </div>
            <div className="bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
              <canvas
                ref={canvasRef}
                data-testid="share-card-canvas"
                className="w-full h-auto block"
                style={{ aspectRatio: '1200 / 630' }}
              />
            </div>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleNativeShare}
                data-testid="share-native-btn"
                className="flex-1 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Share2 size={18} /> Share image (mobile share sheet)
              </button>
              <button
                onClick={downloadShareCard}
                data-testid="share-download-btn"
                className="flex-1 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-amber-400 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} /> Download PNG
              </button>
            </div>
            <p className="text-slate-500 text-xs mt-3">
              Tip: attach this image to your Facebook/Instagram post for a much higher click-through rate than a plain link.
            </p>
          </div>
        </div>
      </section>

      {/* Snippets */}
      <section className="py-12 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-2">Ready-to-send messages</h2>
          <p className="text-slate-400 text-sm mb-8">
            Each one is pre-written and ready to copy. Personalize the opening if you like.
          </p>
          <div className="space-y-5">
            {Object.entries(SNIPPETS).map(([k, snippet]) => (
              <SnippetCard key={k} k={k} snippet={snippet} />
            ))}
          </div>
        </div>
      </section>

      {/* Closing encouragement */}
      <section className="py-12 bg-gradient-to-r from-amber-900/20 via-slate-900 to-amber-900/20 border-y border-amber-500/20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-white text-lg leading-relaxed italic">
            &ldquo;Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.&rdquo;
          </p>
          <p className="text-amber-400 text-sm font-semibold mt-3">, Matthew 5:16</p>
        </div>
      </section>
    </div>
  );
};

export default ShareKit;
