import React from 'react';
import { Flame, Calendar, MapPin, Clock } from 'lucide-react';
import { encounters } from '../data/mock';

const Encounters = () => {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://customer-assets.emergentagent.com/job_himandsee-faith/artifacts/6c37qiei_IMG_1554.jpeg" 
            alt="Encounter is Waiting" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/70 to-slate-900/90"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_himandsee-faith/artifacts/6c37qiei_IMG_1554.jpeg" 
              alt="Encounter Logo" 
              className="h-40 w-40 mx-auto object-contain drop-shadow-2xl"
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            <span className="text-amber-400">Encounter</span> is Waiting
          </h1>
          
          <p className="text-2xl md:text-3xl text-purple-200 italic mb-6">
            "Draw near. Be changed."
          </p>
          
          <p className="text-xl text-slate-300 mb-4">
            James 4:8
          </p>

          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-10">
            Experience powerful worship, life-transforming prayer, and divine encounters 
            that will forever change your relationship with God. This is more than a service—
            it's a moment where heaven touches earth.
          </p>

          <a 
            href="#upcoming" 
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold text-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-xl shadow-amber-500/30"
          >
            <Flame className="mr-2" size={24} />
            Join an Encounter
          </a>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What to <span className="text-amber-400">Expect</span>
            </h2>
            <p className="text-slate-400 text-lg">
              An atmosphere where God's presence is tangible and transformation happens
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-8 hover:border-amber-500/50 transition-all">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Flame className="text-amber-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-4">Powerful Worship</h3>
              <p className="text-slate-300 text-center leading-relaxed">
                Led by anointed worship leaders, we create space for you to connect with 
                God through authentic, spirit-filled worship that ushers in His presence.
              </p>
            </div>

            <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-8 hover:border-amber-500/50 transition-all">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <img 
                  src="https://images.unsplash.com/photo-1520187044487-b2efb58f0cba" 
                  alt="Prayer" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-4">Deep Prayer</h3>
              <p className="text-slate-300 text-center leading-relaxed">
                Experience corporate prayer, personal ministry, and prophetic intercession 
                as we seek God together and minister to one another in His love.
              </p>
            </div>

            <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-8 hover:border-amber-500/50 transition-all">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <img 
                  src="https://images.unsplash.com/photo-1570786032462-2efc3ca8fccd" 
                  alt="Worship" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-4">Biblical Teaching</h3>
              <p className="text-slate-300 text-center leading-relaxed">
                Receive fresh revelation from God's Word through anointed teaching that 
                equips, encourages, and empowers you to live victoriously.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Encounter Series */}
      <section id="upcoming" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="text-amber-400">Encounter</span> Series
            </h2>
            <p className="text-slate-400 text-lg">
              Regular gatherings designed for you to meet with God
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {encounters.map((encounter) => (
              <div 
                key={encounter.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-8 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10"
              >
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg mb-6">
                  <Flame className="text-slate-900" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{encounter.title}</h3>
                <p className="text-slate-300 leading-relaxed mb-6">{encounter.description}</p>
                <div className="flex items-center text-amber-400 font-semibold">
                  <Calendar size={18} className="mr-2" />
                  {encounter.schedule}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="text-amber-400">Transformed</span> Lives
            </h2>
            <p className="text-slate-400 text-lg">
              Hear from those who encountered God and were forever changed
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-slate-900 border border-purple-500/20 rounded-xl p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-500/10 rounded-full mb-6">
                <Flame className="text-amber-400" size={24} />
              </div>
              <p className="text-slate-300 leading-relaxed mb-6 italic text-lg">
                "I came broken and lost, but during an Encounter night, I felt God's presence 
                like never before. My life has never been the same. I found purpose, healing, 
                and a renewed passion to follow Christ."
              </p>
              <div>
                <p className="text-white font-semibold">David R.</p>
                <p className="text-amber-400 text-sm">Ministry Volunteer</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-purple-500/20 rounded-xl p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-500/10 rounded-full mb-6">
                <Flame className="text-amber-400" size={24} />
              </div>
              <p className="text-slate-300 leading-relaxed mb-6 italic text-lg">
                "The worship was so powerful, and I experienced healing during prayer ministry. 
                God met me in my pain and gave me hope. These Encounter nights are truly 
                life-changing!"
              </p>
              <div>
                <p className="text-white font-semibold">Michelle T.</p>
                <p className="text-amber-400 text-sm">Community Member</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Practical Info */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 border border-amber-500/30 rounded-2xl p-10">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              <span className="text-amber-400">Join Us</span> for the Next Encounter
            </h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <Calendar className="text-amber-400 mt-1 flex-shrink-0" size={24} />
                <div>
                  <p className="text-white font-semibold mb-1">When</p>
                  <p className="text-slate-300">Every Friday at 7:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <MapPin className="text-amber-400 mt-1 flex-shrink-0" size={24} />
                <div>
                  <p className="text-white font-semibold mb-1">Where</p>
                  <p className="text-slate-300">tryHimandsee Ministries Center, Richmond, VA</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Clock className="text-amber-400 mt-1 flex-shrink-0" size={24} />
                <div>
                  <p className="text-white font-semibold mb-1">Duration</p>
                  <p className="text-slate-300">Approximately 2 hours (but we follow the Spirit's leading)</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-white font-semibold mb-3">What to Bring:</h3>
              <ul className="space-y-2 text-slate-300 mb-6">
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  An open heart and expectant spirit
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  Your Bible (optional, but recommended)
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  Come as you are—no dress code, just come ready to encounter God
                </li>
              </ul>

              <div className="text-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/30"
                >
                  Get Directions & Contact Info
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Flame className="text-amber-400 mx-auto mb-6" size={64} />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Your <span className="text-amber-400">Encounter</span> Awaits
          </h2>
          <p className="text-slate-300 text-xl mb-8 leading-relaxed">
            Don't miss the opportunity to experience God in a fresh, powerful way. 
            Come expecting, and leave transformed. We can't wait to worship with you!
          </p>
          <p className="text-purple-300 italic text-lg">
            "Draw near to God, and He will draw near to you." - James 4:8
          </p>
        </div>
      </section>
    </div>
  );
};

export default Encounters;
