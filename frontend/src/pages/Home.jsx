import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, Flame, HandHeart } from 'lucide-react';
import { ministryInfo, services, testimonials, upcomingEvents } from '../data/mock';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1509059852496-f3822ae057bf" 
            alt="Community Outreach" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-amber-900/80"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8 animate-fade-in">
            <img 
              src="https://customer-assets.emergentagent.com/job_himandsee-faith/artifacts/509g4xo6_IMG_1555.png" 
              alt="tryHimandsee Ministries" 
              className="h-32 w-32 mx-auto object-contain mb-6 drop-shadow-2xl"
            />
          </div>
          
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
                At tryHimandsee Ministries, we believe in the transformative power of God's love. 
                Our dual mission combines spiritual awakening with practical compassion, 
                serving the whole person—body, mind, and spirit.
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

      {/* Testimonials */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Lives <span className="text-amber-400">Transformed</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Hear from those whose lives have been touched by God's love through this ministry
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-amber-500/10 rounded-full mb-6">
                  <Heart className="text-amber-400" size={24} />
                </div>
                <p className="text-slate-300 leading-relaxed mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-amber-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
    </div>
  );
};

export default Home;
