import React from 'react';
import { UtensilsCrossed, Shirt, Sparkles, Heart, HandHeart, Users } from 'lucide-react';
import { services } from '../data/mock';

const Ministries = () => {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-900">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1608686207856-001b95cf60ca" 
            alt="Food Distribution" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Our <span className="text-amber-400">Ministries</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Serving Richmond and Henrico communities with compassion, dignity, and the love of Christ
          </p>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {/* The PEW Pantry */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                  <UtensilsCrossed className="text-amber-400" size={36} />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">The <span className="text-amber-400">PEW</span> Pantry</h2>
                <div className="text-slate-300 text-lg leading-relaxed space-y-4">
                  <p>
                    Growing up, the pew was more than a seat in the sanctuary, it was the place where people came to receive, to rest, and to be renewed. It's where the pastor would <strong className="text-white">provide</strong> spiritual food, <strong className="text-white">encourage</strong> the broken, and be a <strong className="text-white">witness</strong> to the life-changing power of the Gospel.
                  </p>
                  <p>
                    The PEW Pantry carries that same assignment. We aim to <strong className="text-amber-400">PROVIDE</strong> food with dignity, <strong className="text-amber-400">ENCOURAGE</strong> every person we encounter, and be a <strong className="text-amber-400">WITNESS</strong> of God's love in action.
                  </p>
                  <p className="text-amber-400 font-semibold italic">
                    Provide. Encourage. Witness. No questions asked.
                  </p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <img 
                  src="/images/pew-pantry.jpg" 
                  alt="The PEW Pantry — Food with Dignity" 
                  className="rounded-2xl shadow-2xl w-full"
                />
              </div>
            </div>

            {/* Garments of Grace */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="/images/garments-of-grace.jpg" 
                  alt="Garments of Grace — Clothed in Dignity" 
                  className="rounded-2xl shadow-2xl w-full"
                />
              </div>
              <div>
                <div className="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Shirt className="text-amber-400" size={36} />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4"><span className="text-amber-400">Garments</span> of Grace</h2>
                <div className="text-slate-300 text-lg leading-relaxed space-y-4">
                  <p>
                    Just as God covers us with His grace, we aim to extend that same covering to our community through quality clothing, warm hospitality, and Christ-centered encouragement.
                  </p>
                  <p>
                    Every garment we share is a reminder that you are seen, valued, and worthy. <em className="text-white">And worthiness should be worn.</em>
                  </p>
                  <p>
                    Garments of Grace gives confidence, comfort, and care.
                  </p>
                  <p className="text-amber-400 font-semibold italic">
                    Clothed in dignity. Covered in grace.
                  </p>
                </div>
              </div>
            </div>

            {/* Kingdom Care Hygiene Kits */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="text-amber-400" size={36} />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4"><span className="text-amber-400">Kingdom Care</span> Hygiene Kits</h2>
                <div className="text-slate-300 text-lg leading-relaxed space-y-4">
                  <p>
                    Through basic care and spiritual love, we aim to provide essential hygiene items that uplift, strengthen, and remind each recipient of their God-given worth.
                  </p>
                  <p className="text-white font-semibold">Each hygiene kit includes a selection of personal-care essentials such as:</p>
                  <ul className="space-y-2 ml-1">
                    {[
                      'Toothpaste & toothbrush',
                      'Soap or body wash',
                      'Deodorant',
                      'Lotion',
                      'Feminine hygiene items',
                      'Wipes',
                      'Shampoo & conditioner',
                      'Seasonal or special-care items as available',
                    ].map((item) => (
                      <li key={item} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-amber-400 rounded-full mt-2.5 flex-shrink-0"></div>
                        <span className="text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p>
                    Every item is chosen with respect to quality and comfort. A simple kit can help someone feel prepared for work, school, appointments, or daily life, and remind them that they are seen and valued.
                  </p>
                  <p className="text-amber-400 font-semibold italic">
                    This is care fit for the King's kids.
                  </p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <img 
                  src="/images/kingdom-care.jpg" 
                  alt="Kingdom Care Hygiene Kits" 
                  className="rounded-2xl shadow-2xl w-full"
                />
              </div>
            </div>

            {/* Prayer & Spiritual Support */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1520187044487-b2efb58f0cba" 
                  alt="Prayer" 
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div>
                <div className="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Heart className="text-amber-400" size={36} />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">Prayer & Spiritual Support</h2>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  We believe in the power of prayer and the importance of spiritual care. 
                  Our team is available to pray with you and provide spiritual encouragement 
                  during difficult times.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-slate-400">Biblical encouragement and support</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-slate-400">Prayer support during challenging times</p>
                  </div>
                </div>
                <div className="mt-8">
                  <a 
                    href="/prayer-requests" 
                    className="inline-flex items-center px-6 py-3 bg-amber-500 text-slate-900 rounded-lg font-semibold hover:bg-amber-400 transition-all"
                  >
                    Submit a Prayer Request
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-950 via-amber-900/20 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HandHeart className="text-amber-400 mx-auto mb-6" size={56} />
          <h2 className="text-4xl font-bold text-white mb-6">
            Help Us <span className="text-amber-400">Serve More</span>
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Your support enables us to continue providing essential services to those in need. 
            Every donation makes a direct impact in someone's life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/donate" 
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/30"
            >
              Make a Donation
            </a>
            <a 
              href="/get-involved" 
              className="px-8 py-4 bg-transparent border-2 border-amber-400 text-amber-400 rounded-lg font-semibold hover:bg-amber-400/10 transition-all"
            >
              Volunteer Today
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Ministries;
