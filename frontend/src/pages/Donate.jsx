import React, { useState, useEffect } from 'react';
import { Heart, DollarSign, CreditCard, Check, Loader2, Gift, Sparkles, UtensilsCrossed, HandHeart } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { createPaymentCheckout, getPaymentStatus } from '../services/api';
import WheelOfBlessing from '../components/WheelOfBlessing';
import { HiddenDove } from '../components/DoveHunt';
import PageMeta from '../components/PageMeta';

// Compute what a given dollar amount "buys" for the impact preview card.
const computeImpact = (rawAmount) => {
  const amt = Math.max(0, Number(rawAmount) || 0);
  return {
    kits: Math.floor(amt / 25),
    weeklyGroceries: Math.floor(amt / 50),
    miracles: Math.floor(amt / 100),
    gasTanks: Math.floor(amt / 40),
  };
};

const fireConfetti = () => {
  const fire = (particleRatio, opts) => {
    confetti({
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#fde68a', '#ffffff'],
      ...opts,
      particleCount: Math.floor(220 * particleRatio),
    });
  };
  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
};

const Donate = () => {
  const [donationType, setDonationType] = useState('one-time');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const presetAmounts = ['25', '50', '100', '250', '500'];

  // Check for payment success on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');

    if (sessionId && success) {
      pollPaymentStatus(sessionId);
    } else if (canceled) {
      toast.error('Payment was canceled. Please try again when ready.');
      // Clean up URL
      window.history.replaceState({}, '', '/donate');
    }
  }, []);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    setCheckingPayment(true);

    if (attempts >= maxAttempts) {
      toast.error('Payment verification timed out. Please check your email for confirmation.');
      setCheckingPayment(false);
      window.history.replaceState({}, '', '/donate');
      return;
    }

    try {
      const status = await getPaymentStatus(sessionId);
      
      if (status.payment_status === 'paid') {
        toast.success('Thank you for your generous donation! Your payment was successful.');
        fireConfetti();
        setTimeout(fireConfetti, 350);
        setTimeout(fireConfetti, 700);
        setCheckingPayment(false);
        // Clean up URL
        window.history.replaceState({}, '', '/donate');
        // Reset form
        setAmount('');
        setCustomAmount('');
        setDonorInfo({ name: '', email: '', message: '' });
        return;
      } else if (status.status === 'expired') {
        toast.error('Payment session expired. Please try again.');
        setCheckingPayment(false);
        window.history.replaceState({}, '', '/donate');
        return;
      }

      // Continue polling if still pending
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error('Error verifying payment. Please contact us if you were charged.');
      setCheckingPayment(false);
      window.history.replaceState({}, '', '/donate');
    }
  };

  const handleDonation = async (e) => {
    e.preventDefault();
    const donationAmount = amount === 'custom' ? customAmount : amount;
    
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error('Please select a valid donation amount');
      return;
    }

    if (!donorInfo.name || !donorInfo.email) {
      toast.error('Please provide your name and email');
      return;
    }

    setIsProcessing(true);

    try {
      const originUrl = window.location.origin;
      
      const paymentData = {
        amount: parseFloat(donationAmount),
        donation_type: donationType,
        name: donorInfo.name,
        email: donorInfo.email,
        message: donorInfo.message || null,
        origin_url: originUrl
      };

      const session = await createPaymentCheckout(paymentData);
      
      // Redirect to Stripe checkout
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      toast.error('Failed to initiate payment. Please try again or contact us directly.');
      console.error('Payment error:', error);
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e) => {
    setDonorInfo({
      ...donorInfo,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen pt-20">
      <PageMeta
        title="Give a Gift"
        description="Support tryHimandsee ministries with a one-time or monthly donation. Every gift fuels food, clothing, hygiene kits, and Monthly Miracle Runs serving Richmond &amp; Henrico."
        path="/donate"
      />
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-900">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433" 
            alt="Donation" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="text-amber-400 mx-auto mb-6" size={64} />
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Make a <span className="text-amber-400">Difference</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Your generous donation helps us provide food, clothing, and hygiene kits to those in need 
            while sharing the transformative love of Christ throughout our community.
          </p>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your Impact
            </h2>
            <p className="text-slate-400 text-lg">
              See how your donation directly serves our community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-8 text-center hover:border-amber-500/50 transition-all">
              <div className="text-4xl font-bold text-amber-400 mb-2">$25</div>
              <p className="text-white font-semibold mb-3">Provides</p>
              <p className="text-slate-300">A complete hygiene kit for a family in need</p>
            </div>

            <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-8 text-center hover:border-amber-500/50 transition-all">
              <div className="text-4xl font-bold text-amber-400 mb-2">$50</div>
              <p className="text-white font-semibold mb-3">Provides</p>
              <p className="text-slate-300">A week's worth of groceries for a family of four</p>
            </div>

            <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-8 text-center hover:border-amber-500/50 transition-all">
              <div className="text-4xl font-bold text-amber-400 mb-2">$100</div>
              <p className="text-white font-semibold mb-3">Provides</p>
              <p className="text-slate-300">Clothing essentials and food supplies for multiple families</p>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-10">
              <DollarSign className="text-amber-400 mx-auto mb-4" size={48} />
              <h2 className="text-3xl font-bold text-white mb-2">
                Give Today
              </h2>
              <p className="text-slate-400">
                Choose your donation amount and frequency
              </p>
            </div>

            <form onSubmit={handleDonation}>
              {/* Donation Type */}
              <div className="mb-8">
                <label className="block text-white font-semibold mb-4">Donation Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDonationType('one-time')}
                    className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                      donationType === 'one-time'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    One-Time
                  </button>
                  <button
                    type="button"
                    onClick={() => setDonationType('monthly')}
                    className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                      donationType === 'monthly'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="mb-8">
                <label className="block text-white font-semibold mb-4">Select Amount</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setAmount(preset);
                        setCustomAmount('');
                      }}
                      className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                        amount === preset
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setAmount('custom')}
                    className={`px-6 py-3 rounded-lg border-2 font-semibold transition-all ${
                      amount === 'custom'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    Custom
                  </button>
                  {amount === 'custom' && (
                    <div className="flex-1">
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="1"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  )}
                </div>

                {/* Live Impact Preview — shows what their amount buys */}
                {(() => {
                  const currentAmount = amount === 'custom' ? customAmount : amount;
                  const impact = computeImpact(currentAmount);
                  const lines = [
                    impact.kits > 0 && { Icon: Sparkles, label: `${impact.kits} hygiene ${impact.kits === 1 ? 'kit' : 'kits'} for families in need` },
                    impact.weeklyGroceries > 0 && { Icon: UtensilsCrossed, label: `${impact.weeklyGroceries} week${impact.weeklyGroceries === 1 ? '' : 's'} of groceries for a family of four` },
                    impact.miracles > 0 && { Icon: Gift, label: `${impact.miracles} Monthly Miracle Run blessing${impact.miracles === 1 ? '' : 's'}` },
                    impact.gasTanks > 0 && { Icon: HandHeart, label: `${impact.gasTanks} tank${impact.gasTanks === 1 ? '' : 's'} of gas for a neighbor` },
                  ].filter(Boolean);
                  if (!currentAmount || Number(currentAmount) <= 0) return null;
                  return (
                    <div
                      data-testid="donation-impact-preview"
                      className="mt-5 bg-gradient-to-r from-amber-900/10 via-slate-900/40 to-amber-900/10 border border-amber-500/30 rounded-lg p-5 animate-in fade-in duration-300"
                    >
                      <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">
                        Your ${currentAmount} could provide
                      </p>
                      <ul className="space-y-2">
                        {lines.length > 0 ? (
                          lines.map(({ Icon, label }) => (
                            <li key={label} className="flex items-start gap-3 text-slate-200">
                              <Icon className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                              <span>{label}</span>
                            </li>
                          ))
                        ) : (
                          <li className="flex items-start gap-3 text-slate-200">
                            <Gift className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                            <span>Items for our Blessing Bags or Monthly Miracle Runs</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })()}
              </div>

              {/* Donor Information */}
              <div className="space-y-6 mb-8">
                <div>
                  <label htmlFor="donor-name" className="block text-white font-semibold mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="donor-name"
                    name="name"
                    value={donorInfo.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="donor-email" className="block text-white font-semibold mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="donor-email"
                    name="email"
                    value={donorInfo.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="donor-message" className="block text-white font-semibold mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    id="donor-message"
                    name="message"
                    value={donorInfo.message}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors resize-none"
                    placeholder="Share why you're giving or a special message..."
                  ></textarea>
                </div>
              </div>

              {/* Payment Notice */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 mb-8">
                <div className="flex items-start space-x-3">
                  <CreditCard className="text-amber-400 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <p className="text-white font-semibold mb-2">Secure Payment Processing</p>
                    <p className="text-slate-300 text-sm">
                      Your donation is processed securely through Stripe. We accept all major credit and debit cards.
                      {checkingPayment && ' Verifying your payment...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!amount || (amount === 'custom' && !customAmount) || isProcessing || checkingPayment}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold text-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    Processing...
                  </>
                ) : checkingPayment ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    Verifying Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2" size={20} />
                    {amount ? `Proceed to Payment - $${amount === 'custom' ? customAmount || '0' : amount}` : 'Select Amount to Continue'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Wheel of Blessing */}
      <section className="py-16 bg-gradient-to-br from-slate-950 via-amber-900/10 to-slate-950 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <WheelOfBlessing />
        </div>
        <div className="absolute bottom-4 right-4">
          <HiddenDove id={4} />
        </div>
      </section>

      {/* Other Ways to Give */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Other Ways to <span className="text-amber-400">Give</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Multiple options to support our mission
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-amber-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Check or Cash</h3>
              <p className="text-slate-400">
                Mail checks to our office or bring cash donations during office hours. 
                Make checks payable to "tryHimandsee Ministries"
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-amber-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">In-Kind Donations</h3>
              <p className="text-slate-400">
                Donate food, clothing, hygiene items, or other supplies. Contact us to coordinate drop-off times.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-amber-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Monthly Partnership</h3>
              <p className="text-slate-400">
                Partner with us through recurring monthly donations to sustain our ministry efforts and reach more families.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tax Information */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm">
            tryHimandsee Ministries is a 501(c)(3) nonprofit organization. All donations are tax-deductible 
            to the extent allowed by law. You will receive a receipt for your records.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Donate;
