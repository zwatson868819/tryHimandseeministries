import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { Printer, Trash2, ExternalLink, Copy, Wand2 } from 'lucide-react';
import { formatDate } from './utils';

const publicOriginFor = () => {
  // Prefer explicit env - many production Cloudflare Pages sites differ from the API host.
  const explicit = process.env.REACT_APP_PUBLIC_URL || process.env.REACT_APP_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  return window.location.origin;
};

const MailboxTab = ({ mailboxes, voices, onGenerate, onDelete }) => {
  const [count, setCount] = useState(10);
  const [distributedBy, setDistributedBy] = useState('');
  const [welcomeText, setWelcomeText] = useState('');
  const [scriptureRef, setScriptureRef] = useState('');
  const [featuredVoiceId, setFeaturedVoiceId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [selectedForPrint, setSelectedForPrint] = useState(new Set());
  const [showQrPrintSheet, setShowQrPrintSheet] = useState(false);
  const [showVoiceQr, setShowVoiceQr] = useState(false);
  const [voiceQrRef, setVoiceQrRef] = useState('miracle-run-' + new Date().toISOString().slice(0, 10));

  const approvedVoices = voices.filter((v) => v.status === 'approved');
  const origin = publicOriginFor();

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await onGenerate({
        count: Number(count) || 10,
        distributed_by: distributedBy.trim() || null,
        welcome_text: welcomeText.trim() || null,
        scripture_ref: scriptureRef.trim() || null,
        featured_voice_id: featuredVoiceId || null,
      });
      // Pre-select the newly-created codes for immediate printing.
      const newCodes = new Set(result?.created?.map((c) => c.code) || []);
      setSelectedForPrint(newCodes);
      toast.success(`Generated ${result?.count ?? 0} codes. Ready to print.`);
    } finally {
      setGenerating(false);
    }
  };

  const toggleSelect = (code) => {
    setSelectedForPrint((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };

  const selectedList = mailboxes.filter((m) => selectedForPrint.has(m.code));
  const voiceRecordUrl = `${origin}/voices/record?ref=${encodeURIComponent(voiceQrRef)}`;

  return (
    <div className="space-y-6" data-testid="admin-mailbox-panel">
      {/* Generator */}
      <div className="bg-slate-950 border border-amber-500/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="text-amber-400" size={18} />
          <h3 className="text-white font-semibold">Generate Miracle Mailbox codes</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 text-xs mb-1">How many codes?</label>
            <input
              type="number"
              min="1"
              max="200"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              data-testid="mailbox-count"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs mb-1">Distributed by / event label</label>
            <input
              type="text"
              value={distributedBy}
              onChange={(e) => setDistributedBy(e.target.value)}
              data-testid="mailbox-distributed-by"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
              placeholder="e.g. Miracle Run - Feb 14"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-slate-400 text-xs mb-1">Custom welcome (optional)</label>
            <textarea
              value={welcomeText}
              onChange={(e) => setWelcomeText(e.target.value)}
              data-testid="mailbox-welcome"
              rows={2}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm resize-none"
              placeholder="Leave blank to use the default message"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs mb-1">Scripture reference (optional)</label>
            <input
              type="text"
              value={scriptureRef}
              onChange={(e) => setScriptureRef(e.target.value)}
              data-testid="mailbox-scripture-ref"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
              placeholder="Isaiah 41:10 (defaults if blank)"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs mb-1">Featured voice testimony (optional)</label>
            <select
              value={featuredVoiceId}
              onChange={(e) => setFeaturedVoiceId(e.target.value)}
              data-testid="mailbox-voice-select"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
            >
              <option value="">None</option>
              {approvedVoices.map((v) => (
                <option key={v.id} value={v.id}>{v.first_name} - {(v.transcript || '').slice(0, 50)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            data-testid="mailbox-generate-btn"
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 disabled:opacity-60"
          >
            {generating ? 'Generating...' : `Generate ${count || 0} codes`}
          </button>
        </div>
      </div>

      {/* Voice Record QR Generator */}
      <div className="bg-slate-950 border border-amber-500/20 rounded-xl p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <QRCodeSVG value="preview" size={16} bgColor="transparent" fgColor="#fbbf24" />
            <h3 className="text-white font-semibold">Voices from the Street - QR code for outreach cards</h3>
          </div>
          <button
            onClick={() => setShowVoiceQr((s) => !s)}
            data-testid="voice-qr-toggle"
            className="text-amber-400 text-sm hover:text-amber-300"
          >
            {showVoiceQr ? 'Hide' : 'Show QR generator'}
          </button>
        </div>
        {showVoiceQr && (
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 text-xs mb-1">Campaign / event ref (tracks which QR they scanned)</label>
              <input
                type="text"
                value={voiceQrRef}
                onChange={(e) => setVoiceQrRef(e.target.value.replace(/\s+/g, '-').toLowerCase())}
                data-testid="voice-qr-ref"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm font-mono"
              />
              <p className="text-slate-500 text-xs mt-1 break-all">Points to: {voiceRecordUrl}</p>
            </div>
            <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3 max-w-sm">
              <QRCodeSVG value={voiceRecordUrl} size={220} level="M" includeMargin />
              <p className="text-slate-900 text-sm font-semibold">Share Your Voice</p>
              <p className="text-slate-600 text-xs text-center">Scan to record a 30-second testimony</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                data-testid="voice-qr-print"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-800 text-white rounded hover:bg-slate-700"
              >
                <Printer size={14} /> Print
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(voiceRecordUrl); toast.success('URL copied'); }}
                data-testid="voice-qr-copy"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-800 text-white rounded hover:bg-slate-700"
              >
                <Copy size={14} /> Copy URL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Codes table */}
      <div>
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <h3 className="text-white font-semibold">
            All mailbox codes ({mailboxes.length}) - {selectedForPrint.size} selected
          </h3>
          <button
            onClick={() => setShowQrPrintSheet(true)}
            disabled={selectedForPrint.size === 0}
            data-testid="mailbox-print-sheet"
            className="inline-flex items-center gap-1 px-4 py-1.5 text-sm bg-amber-500 text-slate-900 rounded font-semibold hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer size={14} /> Print selected as cards
          </button>
        </div>
        {mailboxes.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No codes yet. Generate some above.</p>
        ) : (
          <div className="grid gap-2 max-h-[500px] overflow-y-auto">
            {mailboxes.map((m) => {
              const url = `${origin}/mailbox/${m.code}`;
              const selected = selectedForPrint.has(m.code);
              return (
                <label
                  key={m.code}
                  data-testid={`mailbox-row-${m.code}`}
                  className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                    selected ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleSelect(m.code)}
                    className="flex-shrink-0"
                  />
                  <code className="text-amber-300 font-mono font-bold text-sm w-24">{m.code}</code>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-xs truncate">
                      {m.distributed_by || <span className="text-slate-500 italic">no label</span>} - {m.visit_count} visits
                    </p>
                    <p className="text-slate-500 text-xs">
                      Created {formatDate(m.created_at)}
                      {m.last_visited_at && ` - last visit ${formatDate(m.last_visited_at)}`}
                    </p>
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-400 hover:text-amber-400 flex-shrink-0"
                    title="Open"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); onDelete(m.code); }}
                    data-testid={`mailbox-delete-${m.code}`}
                    className="text-slate-500 hover:text-red-400 flex-shrink-0"
                    title="Delete code"
                  >
                    <Trash2 size={14} />
                  </button>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Print sheet modal */}
      {showQrPrintSheet && selectedList.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 overflow-y-auto"
          data-testid="mailbox-print-modal"
          onClick={() => setShowQrPrintSheet(false)}
        >
          <div className="max-w-5xl mx-auto p-4 print:p-0">
            <div className="flex justify-end mb-4 print:hidden gap-2 sticky top-4 z-10">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-500 text-slate-900 rounded font-semibold hover:bg-amber-400"
              >
                <Printer size={14} className="inline mr-1" /> Print now
              </button>
              <button
                onClick={() => setShowQrPrintSheet(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2" onClick={(e) => e.stopPropagation()}>
              {selectedList.map((m) => {
                const url = `${origin}/mailbox/${m.code}`;
                return (
                  <div
                    key={m.code}
                    className="bg-white rounded-lg p-4 flex flex-col items-center text-center break-inside-avoid"
                    style={{ pageBreakInside: 'avoid' }}
                  >
                    <p className="text-slate-800 text-lg font-bold mb-1">tryHimandsee</p>
                    <p className="text-slate-500 text-xs mb-2">A message for you</p>
                    <QRCodeSVG value={url} size={140} level="M" includeMargin />
                    <p className="text-slate-900 font-mono text-sm font-semibold mt-2">{m.code}</p>
                    <p className="text-slate-500 text-[10px] mt-1 break-all">{url.replace(/^https?:\/\//, '')}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MailboxTab;
