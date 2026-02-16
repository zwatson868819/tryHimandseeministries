import React, { useState } from 'react';
import { Users, HandHeart, Calendar, Check } from 'lucide-react';
import { volunteerOpportunities } from '../data/mock';
import { toast } from 'sonner';
import { submitVolunteer } from '../services/api';

const GetInvolved = () => {
  const [volunteerForm, setVolunteerForm] = useState({
    name: '',
    email: '',
    phone: '',
    opportunity: '',
    message: ''
  });

  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitVolunteer(volunteerForm);
      toast.success('Thank you for signing up! We will contact you soon.');
      setVolunteerForm({ name: '', email: '', phone: '', opportunity: '', message: '' });
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
      console.error('Volunteer form error:', error);
    }
  };

  const handleInputChange = (e) => {
    setVolunteerForm({
      ...volunteerForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-900">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1652971876875-05db98fab376" 
            alt="Volunteers" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Get <span className="text-amber-400">Involved</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Join us in making a difference in Richmond and Henrico. There are many ways to serve, 
            give, and be part of what God is doing through this ministry.
          </p>
        </div>
      </section>

      {/* Ways to Get Involved */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ways to <span className="text-amber-400">Serve</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Find the perfect opportunity to use your gifts and passions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center hover:border-amber-500/50 transition-all">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-amber-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Volunteer</h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                Serve alongside us in food distribution, clothing assistance, event support, 
                and more. Your time and talents make a real impact.
              </p>
              <a 
                href="#volunteer-form" 
                className="inline-block text-amber-400 font-semibold hover:text-amber-300 transition-colors"
              >
                Sign Up to Volunteer →
              </a>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center hover:border-amber-500/50 transition-all">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <HandHeart className="text-amber-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Donate</h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                Your financial support enables us to provide food, clothing, and hygiene kits 
                to those in need. Every dollar makes a difference.
              </p>
              <a 
                href="/donate" 
                className="inline-block text-amber-400 font-semibold hover:text-amber-300 transition-colors"
              >
                Make a Donation →
              </a>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center hover:border-amber-500/50 transition-all">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-amber-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Attend Events</h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                Join us for Encounter nights, community events, and special gatherings. 
                Experience God's presence and connect with others.
              </p>
              <a 
                href="/encounters" 
                className="inline-block text-amber-400 font-semibold hover:text-amber-300 transition-colors"
              >
                View Events →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Opportunities */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Volunteer <span className="text-amber-400">Opportunities</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Choose an area where you'd like to serve
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {volunteerOpportunities.map((opp) => (
              <div 
                key={opp.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-6 hover:border-amber-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{opp.title}</h3>
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full">
                    {opp.commitment}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{opp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer Sign-Up Form */}
      <section id="volunteer-form" className="py-20 bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              <span className="text-amber-400">Sign Up</span> to Volunteer
            </h2>
            <p className="text-slate-400 text-lg">
              Fill out the form below and we'll be in touch soon!
            </p>
          </div>

          <form onSubmit={handleVolunteerSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-white font-semibold mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={volunteerForm.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-white font-semibold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={volunteerForm.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-white font-semibold mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={volunteerForm.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                    placeholder="(804) 555-0100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="opportunity" className="block text-white font-semibold mb-2">
                  Volunteer Opportunity *
                </label>
                <select
                  id="opportunity"
                  name="opportunity"
                  value={volunteerForm.opportunity}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                >
                  <option value="">Select an opportunity</option>
                  {volunteerOpportunities.map((opp) => (
                    <option key={opp.id} value={opp.title}>{opp.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-white font-semibold mb-2">
                  Tell us about yourself (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={volunteerForm.message}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors resize-none"
                  placeholder="Share your experience, interests, or why you'd like to volunteer..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold text-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/30 flex items-center justify-center"
              >
                <Check className="mr-2" size={20} />
                Submit Volunteer Application
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Benefits of Volunteering */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why <span className="text-amber-400">Volunteer</span> With Us?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-amber-400" size={24} />
              </div>
              <h3 className="text-white font-semibold mb-2">Make a Real Impact</h3>
              <p className="text-slate-400 text-sm">Directly touch lives and see the difference you make</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-amber-400" size={24} />
              </div>
              <h3 className="text-white font-semibold mb-2">Grow Spiritually</h3>
              <p className="text-slate-400 text-sm">Deepen your faith as you serve others</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-amber-400" size={24} />
              </div>
              <h3 className="text-white font-semibold mb-2">Build Community</h3>
              <p className="text-slate-400 text-sm">Connect with like-minded believers</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-amber-400" size={24} />
              </div>
              <h3 className="text-white font-semibold mb-2">Flexible Schedule</h3>
              <p className="text-slate-400 text-sm">Find opportunities that fit your availability</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GetInvolved;
