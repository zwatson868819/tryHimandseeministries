import React, { useState, useEffect } from 'react';
import { Send, Heart, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { submitPrayerRequest, getPrayerRequests, recordPrayer, getPrayerCount } from '../services/api';
import { HiddenDove } from '../components/DoveHunt';

const PRAYED_STORAGE_KEY = 'prayedFor';
const getPrayedSet = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(PRAYED_STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
};
const savePrayedSet = (set) => {
  localStorage.setItem(PRAYED_STORAGE_KEY, JSON.stringify(Array.from(set)));
};

const PrayerRequests = () => {
  const [prayerForm, setPrayerForm] = useState({
    name: '',
    email: '',
    request: '',
    isAnonymous: false
  });
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prayedSet, setPrayedSet] = useState(() => getPrayedSet());
  const [globalPrayerCount, setGlobalPrayerCount] = useState(null);

  useEffect(() => {
    fetchPrayerRequests();
    getPrayerCount().then((d) => setGlobalPrayerCount(d.total)).catch(() => {});
    const interval = setInterval(() => {
      getPrayerCount().then((d) => setGlobalPrayerCount(d.total)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrayerRequests = async () => {
    try {
      const data = await getPrayerRequests(10, true);
      setPrayerRequests(data);
    } catch (error) {
      console.error('Error loading prayer requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitPrayerRequest(prayerForm);
      toast.success('Your prayer request has been submitted. We are praying for you!');
      setPrayerForm({ name: '', email: '', request: '', isAnonymous: false });
      // Refresh prayer wall
      fetchPrayerRequests();
    } catch (error) {
      toast.error('Failed to submit prayer request. Please try again.');
      console.error('Prayer request error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrayerForm({
      ...prayerForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePrayClick = async (requestId) => {
    if (prayedSet.has(requestId)) return;
    // Optimistic update — increment locally before round trip
    setPrayerRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, pray_count: (r.pray_count || 0) + 1 } : r
      )
    );
    const next = new Set(prayedSet);
    next.add(requestId);
    setPrayedSet(next);
    savePrayedSet(next);
    try {
      const { pray_count } = await recordPrayer(requestId);
      setPrayerRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, pray_count } : r))
      );
    } catch {
      // Roll back if request failed
      setPrayerRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, pray_count: Math.max(0, (r.pray_count || 1) - 1) } : r
        )
      );
      const rollback = new Set(prayedSet);
      rollback.delete(requestId);
      setPrayedSet(rollback);
      savePrayedSet(rollback);
      toast.error('Could not record your prayer. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-900">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1520187044487-b2efb58f0cba" 
            alt="Prayer" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="text-amber-400 mx-auto mb-6" size={64} />
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Prayer <span className="text-amber-400">Requests</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-4">
            We believe in the power of prayer and would be honored to stand with you in faith.
          </p>
          <p className="text-amber-300 italic text-lg">
            "The prayer of a righteous person is powerful and effective." - James 5:16
          </p>
        </div>
      </section>

      {/* Submit Prayer Request */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-4">
                Submit Your <span className="text-amber-400">Prayer Request</span>
              </h2>
              <p className="text-slate-400">
                Share your prayer needs with us. Our prayer team will lift you up in prayer.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    name="isAnonymous"
                    checked={prayerForm.isAnonymous}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400 focus:ring-offset-0"
                  />
                  <label htmlFor="isAnonymous" className="text-white font-semibold">
                    Submit this request anonymously
                  </label>
                </div>

                {!prayerForm.isAnonymous && (
                  <>
                    <div>
                      <label htmlFor="name" className="block text-white font-semibold mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={prayerForm.name}
                        onChange={handleInputChange}
                        required={!prayerForm.isAnonymous}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-white font-semibold mb-2">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={prayerForm.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                        placeholder="john@example.com"
                      />
                      <p className="text-slate-500 text-sm mt-2">
                        We'll only use this to follow up with you if needed
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="request" className="block text-white font-semibold mb-2">
                    Prayer Request *
                  </label>
                  <textarea
                    id="request"
                    name="request"
                    value={prayerForm.request}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors resize-none"
                    placeholder="Share your prayer request here... We're honored to pray with you."
                  ></textarea>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-slate-300 text-sm">
                    <strong className="text-amber-400">Privacy Note:</strong> Your prayer request will be 
                    shared with our prayer team. If you need assistance or crisis support, please also 
                    contact us directly or call our office.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold text-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/30 flex items-center justify-center"
                >
                  <Send className="mr-2" size={20} />
                  Submit Prayer Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Recent Prayer Requests (Community Wall) */}
      <section className="py-20 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Community <span className="text-amber-400">Prayer Wall</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Join us in praying for these requests from our community
            </p>
            {globalPrayerCount !== null && globalPrayerCount > 0 && (
              <div
                data-testid="global-prayer-count"
                className="mt-5 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
                </span>
                <span className="text-amber-300 text-sm font-semibold">
                  {globalPrayerCount.toLocaleString()} prayers offered on this wall
                </span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {loading ? (
              <div className="col-span-2 text-center text-slate-400 py-8">
                Loading prayer requests...
              </div>
            ) : prayerRequests.length === 0 ? (
              <div className="col-span-2 text-center text-slate-400 py-8">
                No prayer requests yet. Be the first to submit one!
              </div>
            ) : (
              prayerRequests.map((request) => (
                <div 
                  key={request.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-6 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
                        <Heart className="text-amber-400" size={20} />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{request.display_name || 'Anonymous'}</p>
                        <div className="flex items-center text-slate-500 text-sm">
                          <Clock size={14} className="mr-1" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed italic">&ldquo;{request.request}&rdquo;</p>
                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handlePrayClick(request.id)}
                      disabled={prayedSet.has(request.id)}
                      data-testid={`pray-btn-${request.id}`}
                      className={`text-sm font-semibold transition-all flex items-center gap-1.5 ${
                        prayedSet.has(request.id)
                          ? 'text-amber-300 cursor-default'
                          : 'text-amber-400 hover:text-amber-300'
                      }`}
                    >
                      <Heart
                        size={16}
                        className={prayedSet.has(request.id) ? 'fill-amber-400 text-amber-400' : ''}
                      />
                      {prayedSet.has(request.id) ? 'I prayed' : 'I will pray'}
                    </button>
                    {(request.pray_count || 0) > 0 && (
                      <span className="text-slate-500 text-xs">
                        {request.pray_count} {request.pray_count === 1 ? 'person prayed' : 'people prayed'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-10">
            <p className="text-slate-400">
              Showing recent prayer requests. Submit yours to be added to our prayer wall.
            </p>
          </div>
        </div>
      </section>

      {/* Prayer Team Info */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 via-amber-900/10 to-slate-900 border border-amber-500/30 rounded-2xl p-10 text-center">
            <Heart className="text-amber-400 mx-auto mb-6" size={56} />
            <h2 className="text-3xl font-bold text-white mb-6">
              Our <span className="text-amber-400">Prayer Team</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Our dedicated prayer team meets regularly to intercede for every request submitted. 
              We believe in the power of corporate prayer and the faithfulness of God to hear and answer.
            </p>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              Whether you're facing a crisis, celebrating a victory, or simply need encouragement, 
              we're here to pray with you and for you.
            </p>
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">
                Interested in joining our prayer team? Contact us to learn more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scripture & Encouragement */}
      <section className="py-16 bg-slate-900 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <p className="text-slate-300 text-xl italic leading-relaxed">
              "Do not be anxious about anything, but in every situation, by prayer and petition, 
              with thanksgiving, present your requests to God. And the peace of God, which transcends 
              all understanding, will guard your hearts and your minds in Christ Jesus."
            </p>
            <p className="text-amber-400 font-semibold">
              - Philippians 4:6-7
            </p>
          </div>
        </div>
        <div className="absolute bottom-4 right-4">
          <HiddenDove id={5} />
        </div>
      </section>
    </div>
  );
};

export default PrayerRequests;
