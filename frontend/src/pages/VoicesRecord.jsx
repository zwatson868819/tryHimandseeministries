import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mic, Square, Play, Send, CheckCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import PageMeta from '../components/PageMeta';
import { submitVoiceTestimony } from '../services/api';

const MAX_SECONDS = 30;
const CATEGORIES = [
  { key: 'testimony', label: 'Testimony' },
  { key: 'praise',    label: 'Praise' },
  { key: 'thanks',    label: 'Gratitude' },
  { key: 'prayer',    label: 'Prayer' },
];

const VoicesRecord = () => {
  const [searchParams] = useSearchParams();
  const refSource = searchParams.get('ref') || '';

  const [firstName, setFirstName] = useState('');
  const [category, setCategory] = useState('testimony');
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const tickRef = useRef(null);
  const stopTimeoutRef = useRef(null);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    clearInterval(tickRef.current);
    clearTimeout(stopTimeoutRef.current);
  }, [audioUrl]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
      setSeconds(0);
      tickRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      stopTimeoutRef.current = setTimeout(() => stop(), MAX_SECONDS * 1000);
    } catch {
      toast.error('Please allow microphone access to record.');
    }
  };

  const stop = () => {
    clearInterval(tickRef.current);
    clearTimeout(stopTimeoutRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const reset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setSeconds(0);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) return toast.error('Please share your first name.');
    if (!audioBlob) return toast.error('Please record a testimony first.');
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('audio', audioBlob, 'testimony.webm');
      form.append('first_name', firstName.trim());
      form.append('category', category);
      form.append('ref_source', refSource);
      form.append('duration_sec', String(seconds));
      await submitVoiceTestimony(form);
      setSubmitted(true);
      toast.success('Thank you! Your voice has been received.');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Unable to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24" data-testid="voices-record-page">
      <PageMeta title="Share Your Voice" description="Record a 30-second audio testimony." path="/voices/record" />

      <section className="py-12">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/voices" className="text-slate-400 hover:text-amber-400 text-sm mb-4 inline-block">&larr; Back to Voices</Link>
          <div className="bg-gradient-to-br from-slate-950 via-amber-900/10 to-slate-950 border border-amber-500/30 rounded-2xl p-8">
            {submitted ? (
              <div className="text-center py-6" data-testid="voices-success">
                <CheckCircle className="text-amber-400 mx-auto mb-4" size={56} />
                <h2 className="text-2xl font-bold text-white mb-2">Thank you</h2>
                <p className="text-slate-300 mb-6">Your voice has been received. A team member will review it before it appears on the wall.</p>
                <div className="flex justify-center gap-2">
                  <Link to="/voices" className="px-5 py-2 border border-amber-500/40 text-amber-300 rounded-lg font-medium hover:bg-amber-500/10">Back to wall</Link>
                  <button
                    type="button"
                    onClick={() => { setSubmitted(false); setFirstName(''); reset(); }}
                    data-testid="voices-record-another"
                    className="px-5 py-2 bg-amber-500 text-slate-900 rounded-lg font-semibold hover:bg-amber-400"
                  >
                    Record another
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-full mb-3">
                    <Mic className="text-amber-400" size={26} />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Share Your Voice</h1>
                  <p className="text-slate-400 text-sm">30-second audio. Your first name only. Reviewed before it goes public.</p>
                </div>

                <form onSubmit={submit} className="space-y-4" data-testid="voices-record-form">
                  <div>
                    <label className="block text-slate-300 text-sm mb-1.5" htmlFor="v-first-name">First name *</label>
                    <input
                      id="v-first-name"
                      data-testid="voice-first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      maxLength={40}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      placeholder="First name only"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-1.5">What are you sharing?</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => setCategory(c.key)}
                          data-testid={`voice-cat-${c.key}`}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                            category === c.key
                              ? 'bg-amber-500 text-slate-900 border-amber-500 font-semibold'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-500/60'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recorder */}
                  <div className="bg-slate-950 border border-slate-700 rounded-xl p-6 text-center">
                    {!audioBlob ? (
                      <>
                        <div className={`text-5xl font-mono mb-4 tabular-nums ${recording ? 'text-rose-400' : 'text-slate-500'}`}>
                          0:{String(seconds).padStart(2, '0')}
                          <span className="text-slate-600 text-2xl"> / 0:{MAX_SECONDS}</span>
                        </div>
                        {!recording ? (
                          <button
                            type="button"
                            onClick={start}
                            data-testid="voice-record-start"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-full font-semibold hover:bg-rose-400 transition-all shadow-lg shadow-rose-500/30"
                          >
                            <Mic size={18} /> Start recording
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stop}
                            data-testid="voice-record-stop"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-full font-semibold hover:bg-slate-700 transition-all border border-slate-600"
                          >
                            <Square size={16} /> Stop
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 text-emerald-400">
                          <CheckCircle size={18} /> <span className="text-sm">Recording captured ({seconds}s)</span>
                        </div>
                        <audio src={audioUrl} controls className="w-full" data-testid="voice-preview" />
                        <button
                          type="button"
                          onClick={() => { reset(); }}
                          data-testid="voice-record-reset"
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-400 text-sm"
                        >
                          <RotateCcw size={14} /> Re-record
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !audioBlob}
                    data-testid="voice-submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Sending...' : (<><Send size={18} /> Send my voice</>)}
                  </button>
                  <p className="text-slate-500 text-xs text-center">
                    By submitting, you agree we may share your first name and recording on this website. We will never share your last name.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VoicesRecord;
