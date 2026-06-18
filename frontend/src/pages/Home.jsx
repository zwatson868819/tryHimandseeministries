import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, Flame, HandHeart, Feather, Mail, CheckCircle, MapPin, ChevronLeft, ChevronRight, Quote, Target, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { ministryInfo, services, upcomingEvents } from '../data/mock';
import { subscribeToBlog, getPublicTestimonies, getDonationProgress } from '../services/api';

const Home = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [testimonies, setTestimonies] = useState([]);
  const [testimonyIndex, setTestimonyIndex] = useState(0);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    getPublicTestimonies(20).then(setTestimonies).catch(() => {});
    getDonationProgress().then(setProgress).catch(() => {});
  }, []);

  useEffect(() => {
    if (testimonies.length <= 1) return;
    const id = setInterval(() => {
      setTestimonyIndex((i) => (i + 1) % testimonies.length);
    }, 7000);
    return () => clearInterval(id);
  }, [testimonies.length]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      await subscribeToBlog({ email });
      setSubscribed(true);
      toast.success("You're subscribed — welcome to the Secret Place");
      setEmail('');
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Subscription failed';
      toast.error(msg);
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Official Logo as Main Background - Larger and Darker */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <img 
            src="https://customer-assets.emergentagent.com/job_himandsee-faith/artifacts/1dw759ji_OFFICIALtryHimandseeLogo.png" 
            alt="tryHimandsee ministries" 
            className="min-w-[120%] min-h-[120%] object-contain opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up">
            <span className="text-amber-400">Freely</span> Received,<br />
            <span className="text-amber-400">Freely</span> Give
          </h1>
          
          <p className="text-xl md:text-2xl text-amber-100 mb-4 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            {ministryInfo.mission}
          </p>
          
          <p className="text-amber-300 italic mb-12 animate-fade-in-up animation-delay-300">
            {ministryInfo.tagline} - {ministryInfo.verse}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Link 
              to="/get-involved" 
              className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold text-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 flex items-center justify-center"
            >
              Get Involved
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link 
              to="/encounters" 
              className="px-8 py-4 bg-transparent border-2 border-amber-400 text-amber-400 rounded-lg font-semibold text-lg hover:bg-amber-400/10 transition-all duration-300 flex items-center justify-center"
            >
              <Flame className="mr-2" size={20} />
              Experience Encounters
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-amber-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-amber-400 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Our <span className="text-amber-400">Mission</span>
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                At tryHimandsee ministries, we believe in the transformative power of God's love. 
                Our dual mission combines spiritual awakening with practical compassion, 
                serving the whole person: body, mind, and spirit.
              </p>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                Through our outreach programs in Richmond and Henrico, we provide essential 
                resources while sharing the hope and love of Christ with those who need it most.
              </p>
              <Link 
                to="/about" 
                className="inline-flex items-center text-amber-400 font-semibold hover:text-amber-300 transition-colors"
              >
                Learn More About Us
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c" 
                alt="Community Impact" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How We <span className="text-amber-400">Serve</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Meeting the needs of our community through compassionate action and faithful service
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div 
                key={service.id}
                className="group bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                  {service.icon === 'UtensilsCrossed' && <Heart className="text-amber-400" size={28} />}
                  {service.icon === 'Shirt' && <Users className="text-amber-400" size={28} />}
                  {service.icon === 'Sparkles' && <Flame className="text-amber-400" size={28} />}
                  {service.icon === 'Heart' && <HandHeart className="text-amber-400" size={28} />}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-slate-400 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/ministries" 
              className="inline-flex items-center px-6 py-3 bg-amber-500/10 border border-amber-500/50 text-amber-400 rounded-lg font-semibold hover:bg-amber-500/20 transition-all"
            >
              Explore All Ministries
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Encounters Highlight */}
      <section className="py-20 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://customer-assets.emergentagent.com/job_himandsee-faith/artifacts/6c37qiei_IMG_1554.jpeg" 
            alt="Encounter Background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img 
                src="https://customer-assets.emergentagent.com/job_himandsee-faith/artifacts/6c37qiei_IMG_1554.jpeg" 
                alt="Encounter is Waiting" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                <span className="text-amber-400">Encounter</span> is Waiting
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Experience powerful worship, transformative prayer, and life-changing encounters 
                with the presence of God. Our Encounter series invites you to draw near and be changed.
              </p>
              <p className="text-amber-300 italic text-xl mb-8">
                "Draw near. Be changed." - James 4:8
              </p>
              <Link 
                to="/encounters" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/30"
              >
                <Flame className="mr-2" size={20} />
                Join an Encounter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 bg-slate-950" data-testid="home-testimonies-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Lives <span className="text-amber-400">Transformed</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Stories of God's faithfulness from those touched by this ministry
            </p>
          </div>

          {testimonies.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="text-amber-400 mx-auto mb-6" size={64} />
              <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-6">
                Be the first to share your testimony.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 bg-amber-500/10 border border-amber-500/50 text-amber-400 rounded-lg font-semibold hover:bg-amber-500/20 transition-all"
              >
                Share Your Story
                <ArrowRight className="ml-2" size={18} />
              </Link>
            </div>
          ) : (
            <>
              <div className="relative bg-gradient-to-br from-slate-900 via-amber-900/10 to-slate-900 border border-amber-500/30 rounded-2xl p-8 md:p-12 min-h-[280px] flex items-center" data-testid="home-testimony-card">
                <Quote className="absolute top-6 left-6 text-amber-500/20" size={64} />
                <Quote className="absolute bottom-6 right-6 text-amber-500/20 rotate-180" size={64} />

                <div className="relative w-full text-center">
                  <p className="text-slate-200 text-lg md:text-xl leading-relaxed italic mb-6 max-w-3xl mx-auto whitespace-pre-wrap">
                    "{testimonies[testimonyIndex].testimony}"
                  </p>
                  <div className="flex flex-col items-center">
                    <p className="text-amber-400 font-bold text-lg">
                      {testimonies[testimonyIndex].name}
                    </p>
                    {testimonies[testimonyIndex].location && (
                      <p className="text-slate-500 text-sm flex items-center mt-1">
                        <MapPin size={14} className="mr-1" />
                        {testimonies[testimonyIndex].location}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {testimonies.length > 1 && (
                <div className="flex justify-center items-center mt-6 gap-4">
                  <button
                    onClick={() => setTestimonyIndex((i) => (i - 1 + testimonies.length) % testimonies.length)}
                    data-testid="home-testimony-prev"
                    className="p-2 bg-slate-900 border border-slate-700 rounded-full text-amber-400 hover:bg-slate-800 transition-colors"
                    aria-label="Previous testimony"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex gap-2">
                    {testimonies.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTestimonyIndex(i)}
                        aria-label={`Go to testimony ${i + 1}`}
                        className={`h-2 rounded-full transition-all ${
                          i === testimonyIndex ? 'bg-amber-400 w-8' : 'bg-slate-700 w-2 hover:bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setTestimonyIndex((i) => (i + 1) % testimonies.length)}
                    data-testid="home-testimony-next"
                    className="p-2 bg-slate-900 border border-slate-700 rounded-full text-amber-400 hover:bg-slate-800 transition-colors"
                    aria-label="Next testimony"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}

              <div className="text-center mt-8">
                <Link
                  to="/contact"
                  className="inline-flex items-center text-amber-400 font-semibold hover:text-amber-300 transition-colors"
                >
                  Share your own story
                  <ArrowRight className="ml-2" size={18} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Monthly Donation Goal */}
      {progress && (
        <section className="py-16 bg-slate-900" data-testid="home-donation-goal">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-slate-950 via-amber-900/10 to-slate-950 border border-amber-500/30 rounded-2xl p-8 md:p-10">
              <div className="text-center mb-6">
                <Target className="text-amber-400 mx-auto mb-3" size={40} />
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  <span className="text-amber-400">{progress.month}</span> Outreach Goal
                </h2>
                <p className="text-slate-400 text-sm">
                  Together we serve the underserved of Richmond & Henrico
                </p>
              </div>

              <div className="mb-3 flex justify-between items-end">
                <div className="text-white">
                  <span className="text-3xl md:text-4xl font-bold text-amber-400" data-testid="goal-raised-amount">
                    ${Math.round(progress.raised).toLocaleString()}
                  </span>
                  <span className="text-slate-400 ml-2">
                    raised of ${Math.round(progress.goal).toLocaleString()} goal
                  </span>
                </div>
                <div className="text-amber-400 font-bold text-2xl" data-testid="goal-percent">
                  {progress.percent}%
                </div>
              </div>

              <div className="w-full h-6 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                  style={{ width: `${Math.max(progress.percent, progress.percent > 0 ? 3 : 0)}%` }}
                  data-testid="goal-progress-bar"
                >
                  {progress.percent >= 15 && (
                    <DollarSign className="text-slate-900" size={14} />
                  )}
                </div>
              </div>

              <div className="text-center mt-6">
                <Link
                  to="/donate"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
                >
                  <Heart className="mr-2" size={18} />
                  Help Us Reach the Goal
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Make a <span className="text-amber-400">Difference?</span>
          </h2>
          <p className="text-slate-300 text-xl mb-10 leading-relaxed">
            Whether through volunteering, donating, or joining our Encounter nights, 
            your involvement helps us serve and transform lives in our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/donate" 
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold text-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50"
            >
              Donate Now
            </Link>
            <Link 
              to="/get-involved" 
              className="px-8 py-4 bg-transparent border-2 border-amber-400 text-amber-400 rounded-lg font-semibold text-lg hover:bg-amber-400/10 transition-all"
            >
              Volunteer With Us
            </Link>
          </div>
        </div>
      </section>
      {/* Notes from the Secret Place — Subscribe Call-out */}
      <section className="py-20 bg-slate-950" data-testid="home-notes-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-slate-900 via-amber-900/15 to-slate-900 border border-amber-500/30 rounded-2xl p-8 md:p-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Feather className="text-amber-400 mb-4" size={40} />
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                  Notes from the<br />
                  <span className="text-amber-400">Secret Place</span>
                </h2>
                <p className="text-slate-300 mb-2 italic text-sm">
                  "But thou, when thou prayest, enter into thy closet..." — Matthew 6:6
                </p>
                <p className="text-slate-400 mb-6">
                  Personal reflections, devotionals, and everyday writings. Subscribe to receive new notes in your inbox.
                </p>
                <Link
                  to="/blog"
                  data-testid="home-notes-read-link"
                  className="inline-flex items-center text-amber-400 font-semibold hover:text-amber-300 transition-colors"
                >
                  Read past notes
                  <ArrowRight className="ml-2" size={18} />
                </Link>
              </div>

              <div>
                {subscribed ? (
                  <div className="text-center bg-slate-900/60 border border-amber-500/30 rounded-xl p-6">
                    <CheckCircle className="text-amber-400 mx-auto mb-3" size={40} />
                    <p className="text-white font-semibold mb-1">You're in.</p>
                    <p className="text-slate-400 text-sm">Watch your inbox for the next note.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-3" data-testid="home-notes-subscribe-form">
                    <label className="flex items-center text-white font-semibold">
                      <Mail size={18} className="mr-2 text-amber-400" />
                      Subscribe
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      data-testid="home-notes-email-input"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={subscribing}
                      data-testid="home-notes-subscribe-btn"
                      className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
                    >
                      {subscribing ? 'Subscribing...' : 'Send Me New Notes'}
                    </button>
                    <p className="text-slate-500 text-xs text-center">No spam. Unsubscribe anytime.</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
