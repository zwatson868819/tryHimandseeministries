import React, { useState } from 'react';
import { FileSignature, Send, CheckCircle, Clock, Shield, HandHeart } from 'lucide-react';
import { toast } from 'sonner';
import { submitNotaryRequest } from '../services/api';
import PageMeta from '../components/PageMeta';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  document_type: '',
  preferred_time: '',
  message: '',
};

const Notary = () => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const phone = form.phone.trim();
    if (!name) {
      toast.error('Please enter your name.');
      return;
    }
    if (!phone) {
      toast.error('Please enter a phone number so we can reach you.');
      return;
    }
    setSubmitting(true);
    try {
      await submitNotaryRequest({
        name,
        phone,
        email: form.email.trim() || null,
        document_type: form.document_type.trim() || null,
        preferred_time: form.preferred_time.trim() || null,
        message: form.message.trim() || null,
      });
      setSubmitted(true);
      setForm(initialForm);
      toast.success("Request received - we'll reach out shortly to confirm.");
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Unable to submit your request right now. Please try again.';
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24" data-testid="notary-page">
      <PageMeta
        title="Free Notary Services"
        description="tryHimandsee Ministries offers free notary services to the Richmond and Henrico community. Request an appointment to have your paperwork notarized at no cost."
        path="/notary"
      />

      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-slate-950 via-amber-900/10 to-slate-950 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6">
            <FileSignature className="text-amber-400" size={32} />
          </div>
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">
            A Ministry Service - At No Cost
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Free <span className="text-amber-400">Notary Services</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Need paperwork notarized? tryHimandsee Ministries provides free notary services
            to our Richmond &amp; Henrico neighbors. Send us a request below and we&apos;ll be in
            touch to schedule a time.
          </p>
        </div>
      </section>

      {/* Info tiles */}
      <section className="py-12 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-6 text-center">
            <Shield className="text-amber-400 mx-auto mb-3" size={28} />
            <h3 className="text-white font-semibold mb-1">Commissioned &amp; Trusted</h3>
            <p className="text-slate-400 text-sm">A commissioned notary serves our community with care and confidentiality.</p>
          </div>
          <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-6 text-center">
            <HandHeart className="text-amber-400 mx-auto mb-3" size={28} />
            <h3 className="text-white font-semibold mb-1">Always Free</h3>
            <p className="text-slate-400 text-sm">No fees, ever. This is a gift to the community - freely received, freely given.</p>
          </div>
          <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-6 text-center">
            <Clock className="text-amber-400 mx-auto mb-3" size={28} />
            <h3 className="text-white font-semibold mb-1">Flexible Scheduling</h3>
            <p className="text-slate-400 text-sm">Share a time that works for you - we&apos;ll do our best to accommodate.</p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 bg-slate-900" data-testid="notary-form-section">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-950 via-amber-900/10 to-slate-950 border border-amber-500/30 rounded-2xl p-8 md:p-10">
            {submitted ? (
              <div className="text-center py-6" data-testid="notary-success">
                <CheckCircle className="text-amber-400 mx-auto mb-4" size={56} />
                <h2 className="text-2xl font-bold text-white mb-2">Request Received</h2>
                <p className="text-slate-300 mb-6">
                  Thank you for reaching out. We&apos;ll contact you shortly to confirm a time.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  data-testid="notary-submit-another"
                  className="px-5 py-2 border border-amber-500/40 text-amber-300 rounded-lg font-medium hover:bg-amber-500/10 transition-all"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Request a <span className="text-amber-400">Notary Appointment</span>
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Fields marked <span className="text-amber-400">*</span> are required.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" data-testid="notary-form">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm mb-1.5" htmlFor="notary-name">
                        Name <span className="text-amber-400">*</span>
                      </label>
                      <input
                        id="notary-name"
                        data-testid="notary-name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm mb-1.5" htmlFor="notary-phone">
                        Phone <span className="text-amber-400">*</span>
                      </label>
                      <input
                        id="notary-phone"
                        data-testid="notary-phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                        placeholder="(804) 555-0123"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-1.5" htmlFor="notary-email">
                      Email <span className="text-slate-500 text-xs">(optional)</span>
                    </label>
                    <input
                      id="notary-email"
                      data-testid="notary-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-1.5" htmlFor="notary-doc">
                      Type of paperwork
                    </label>
                    <input
                      id="notary-doc"
                      data-testid="notary-document-type"
                      name="document_type"
                      type="text"
                      value={form.document_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="e.g. Affidavit, Power of Attorney, DMV form..."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-1.5" htmlFor="notary-time">
                      Preferred date / time
                    </label>
                    <input
                      id="notary-time"
                      data-testid="notary-preferred-time"
                      name="preferred_time"
                      type="text"
                      value={form.preferred_time}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="e.g. Sat morning, or 'any time this week'"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-1.5" htmlFor="notary-message">
                      Anything else we should know?
                    </label>
                    <textarea
                      id="notary-message"
                      data-testid="notary-message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                      placeholder="Number of pages, mobility needs, questions..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    data-testid="notary-submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Sending…' : (
                      <>
                        <Send size={18} />
                        Send my request
                      </>
                    )}
                  </button>
                  <p className="text-slate-500 text-xs text-center pt-2">
                    We treat every request in confidence. We&apos;ll reach out by phone or email to confirm.
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

export default Notary;
