import React, { useState } from 'react';
import { Play, Check, X as XIcon, Trash2, Save } from 'lucide-react';
import { formatDate } from './utils';

const CATEGORY_LABELS = {
  praise: 'Praise', prayer: 'Prayer', thanks: 'Thanks', testimony: 'Testimony',
};

const STATUS_COLORS = {
  pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  approved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  rejected: 'bg-slate-700 text-slate-300 border-slate-600',
};

const audioSrc = (v) =>
  v.audio_url || `${process.env.REACT_APP_BACKEND_URL}/api/voices/audio/${v.id}`;

const VoiceRow = ({ voice, onUpdate, onDelete }) => {
  const [transcript, setTranscript] = useState(voice.transcript || '');
  const [dirty, setDirty] = useState(false);

  return (
    <div
      data-testid={`admin-voice-${voice.id}`}
      className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold">{voice.first_name}</span>
          <span className={`px-2 py-0.5 text-xs rounded-full border ${STATUS_COLORS[voice.status] || STATUS_COLORS.pending}`}>
            {voice.status}
          </span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {CATEGORY_LABELS[voice.category] || voice.category || 'testimony'}
          </span>
          <span className="text-slate-500 text-xs">{formatDate(voice.created_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdate(voice.id, { status: 'approved' })}
            data-testid={`voice-approve-${voice.id}`}
            className="px-3 py-1.5 text-xs rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20"
          >
            <Check size={12} className="inline mr-1" /> Approve
          </button>
          <button
            onClick={() => onUpdate(voice.id, { status: 'rejected' })}
            data-testid={`voice-reject-${voice.id}`}
            className="px-3 py-1.5 text-xs rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
          >
            <XIcon size={12} className="inline mr-1" /> Reject
          </button>
          <button
            onClick={() => onDelete(voice.id)}
            data-testid={`voice-delete-${voice.id}`}
            className="px-3 py-1.5 text-xs rounded bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
          >
            <Trash2 size={12} className="inline mr-1" /> Delete
          </button>
        </div>
      </div>
      <audio src={audioSrc(voice)} controls preload="none" className="w-full h-9" />
      <div>
        <label className="block text-slate-400 text-xs mb-1">Transcript</label>
        <textarea
          value={transcript}
          onChange={(e) => { setTranscript(e.target.value); setDirty(true); }}
          data-testid={`voice-transcript-${voice.id}`}
          rows={2}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-slate-200 text-sm resize-none focus:outline-none focus:border-amber-500"
          placeholder="Whisper transcript will appear here (production only)"
        />
        {dirty && (
          <button
            onClick={() => { onUpdate(voice.id, { transcript }); setDirty(false); }}
            data-testid={`voice-transcript-save-${voice.id}`}
            className="mt-2 px-3 py-1 text-xs rounded bg-amber-500 text-slate-900 font-semibold hover:bg-amber-400"
          >
            <Save size={12} className="inline mr-1" /> Save transcript
          </button>
        )}
      </div>
      {voice.ref_source && (
        <p className="text-slate-500 text-xs">From QR campaign: <code>{voice.ref_source}</code></p>
      )}
    </div>
  );
};

const VoicesTab = ({ voices, onUpdate, onDelete }) => {
  const [filter, setFilter] = useState('all');
  const list = filter === 'all' ? voices : voices.filter((v) => v.status === filter);

  return (
    <div data-testid="admin-voices-panel">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            data-testid={`voices-filter-${f}`}
            className={`px-3 py-1.5 rounded-full text-sm capitalize transition-colors ${
              filter === f ? 'bg-amber-500 text-slate-900 font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {f} ({f === 'all' ? voices.length : voices.filter((v) => v.status === f).length})
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No voices in this filter yet.</p>
      ) : (
        <div className="space-y-3">
          {list.map((v) => <VoiceRow key={v.id} voice={v} onUpdate={onUpdate} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
};

export default VoicesTab;
