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
            {/* Food Distribution */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                  <UtensilsCrossed className="text-amber-400" size={36} />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">Food Distribution</h2>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  Our food distribution program provides nutritious meals and groceries to families 
                  facing food insecurity. Every Saturday, we open our doors to serve those in need 
                  with dignity and respect.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-slate-400">Weekly food packages for families</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-slate-400">Fresh produce and pantry staples</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-slate-400">No-questions-asked approach</p>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400 font-semibold">Distribution Times:</p>
                  <p className="text-slate-300">Saturdays, 9:00 AM - 12:00 PM</p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <img 
                  src="https://images.unsplash.com/photo-1608686207856-001b95cf60ca" 
                  alt="Food Distribution" 
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </div>

            {/* Clothing Assistance */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433" 
                  alt="Clothing Distribution" 
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div>
                <div className="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Shirt className="text-amber-400" size={36} />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">Clothing Assistance</h2>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  We provide quality clothing for all ages and seasons, helping community members 
                  maintain dignity while meeting their basic needs. Our clothing closet operates 
                  year-round to serve families.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-slate-400">Clothing for all ages and sizes</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-slate-400">Seasonal items including coats and boots</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-slate-400">Professional attire for job interviews</p>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400 font-semibold">Available:</p>
                  <p className="text-slate-300">Wednesdays & Saturdays, 9:00 AM - 1:00 PM</p>
                </div>
              </div>
            </div>

            {/* Hygiene Kits */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="text-amber-400" size={36} />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">Hygiene Kits</h2>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  Our hygiene kit program provides essential personal care items to individuals 
                  and families, promoting health, wellness, and dignity within our community.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-slate-400">Complete hygiene essentials</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-slate-400">Personal care products for all ages</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-slate-400">Special kits for women and children</p>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400 font-semibold">Kit Contents Include:</p>
                  <p className="text-slate-300">Soap, shampoo, toothpaste, deodorant, and more</p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <img 
                  src="https://images.unsplash.com/photo-1652971876875-05db98fab376" 
                  alt="Hygiene Kits" 
                  className="rounded-2xl shadow-2xl"
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
                  Our team is available to pray with you, provide biblical encouragement, 
                  and offer spiritual guidance during difficult times.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-slate-400">One-on-one prayer sessions</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-slate-400">Biblical counseling and encouragement</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-slate-400">Crisis intervention and support</p>
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

      {/* Impact Stats */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Our <span className="text-amber-400">Impact</span>
            </h2>
            <p className="text-slate-400 text-lg">Making a difference, one life at a time</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-amber-400 mb-2">500+</div>
              <p className="text-slate-300">Meals Served Monthly</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-amber-400 mb-2">200+</div>
              <p className="text-slate-300">Families Helped</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-amber-400 mb-2">150+</div>
              <p className="text-slate-300">Hygiene Kits Distributed</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-amber-400 mb-2">50+</div>
              <p className="text-slate-300">Volunteers Serving</p>
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
