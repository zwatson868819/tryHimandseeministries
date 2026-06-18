import React from 'react';
import { Users, Heart, Target, Award } from 'lucide-react';
import { ministryInfo } from '../data/mock';
import { HiddenDove } from '../components/DoveHunt';

const About = () => {
  const values = [
    {
      icon: <Heart size={32} />,
      title: 'Compassion',
      description: 'Serving with genuine love and care for every person we encounter'
    },
    {
      icon: <Users size={32} />,
      title: 'Community',
      description: 'Building relationships and fostering connections that last'
    },
    {
      icon: <Target size={32} />,
      title: 'Purpose',
      description: 'Living out our calling to share Christ and serve those in need'
    },
    {
      icon: <Award size={32} />,
      title: 'Excellence',
      description: 'Honoring God by doing our best in everything we undertake'
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-900">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1699422697971-34ac6eec8ebc" 
            alt="Community" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About <span className="text-amber-400">Us</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            A faith-driven ministry committed to transforming lives through the love of Christ 
            and compassionate community service
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Our <span className="text-amber-400">Story</span>
              </h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  tryHimandsee Ministries was born from a simple yet powerful vision: to create 
                  a space where people can encounter God's transformative presence while experiencing 
                  His practical love through acts of service.
                </p>
                <p>
                  Founded on the principle of Matthew 10:8, "Freely ye have received, freely give," 
                  we recognized that true ministry addresses both spiritual and physical needs. 
                  Our journey began with a small group of believers who felt called to serve the 
                  underserved communities of Richmond and Henrico.
                </p>
                <p>
                  Today, we continue to grow in our mission, providing food, clothing, and hygiene 
                  kits to those in need while inviting everyone to experience life-changing encounters 
                  with Christ through worship, prayer, and biblical teaching.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1770097005000-edcd87ec41b9" 
                alt="Worship" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-8 hover:border-amber-500/50 transition-all">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                <Target className="text-amber-400" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-slate-300 leading-relaxed text-lg">
                To encourage people to follow Christ and seek encounters with Him while serving 
                the poor and underserved communities through providing food, clothing, and hygiene 
                kits with compassion and dignity.
              </p>
            </div>

            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-8 hover:border-amber-500/50 transition-all">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                <Heart className="text-amber-400" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-slate-300 leading-relaxed text-lg">
                A community where every person experiences God's transforming love and no one 
                goes without their basic needs. We envision a movement of believers who freely 
                give as they have freely received, impacting lives across Richmond and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Core <span className="text-amber-400">Values</span>
            </h2>
            <p className="text-slate-400 text-lg">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-slate-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team/Leadership - Placeholder */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our <span className="text-amber-400">Leadership</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Servant leaders dedicated to God's call and community transformation
            </p>
          </div>

          <div className="bg-slate-950 border border-amber-500/20 rounded-2xl p-12 text-center">
            <Heart className="text-amber-400 mx-auto mb-6" size={48} />
            <p className="text-slate-300 text-lg mb-6">
              Our ministry is led by a passionate team of believers committed to serving 
              Christ and our community with excellence and integrity.
            </p>
            <p className="text-amber-400 italic">
              "As each has received a gift, use it to serve one another, as good stewards 
              of God's varied grace." - 1 Peter 4:10
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-slate-950 via-amber-900/20 to-slate-950 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join Us in This <span className="text-amber-400">Journey</span>
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Whether you're looking to volunteer, partner with us, or experience an encounter 
            with God, we'd love to connect with you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/30"
            >
              Get in Touch
            </a>
            <a 
              href="/get-involved" 
              className="px-8 py-4 bg-transparent border-2 border-amber-400 text-amber-400 rounded-lg font-semibold hover:bg-amber-400/10 transition-all"
            >
              Get Involved
            </a>
          </div>
        </div>
        {/* Hidden dove #2 */}
        <div className="absolute bottom-4 left-4">
          <HiddenDove id={2} />
        </div>
      </section>
    </div>
  );
};

export default About;
