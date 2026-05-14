import React, { useState } from 'react';
import { Mail, MapPin, Send, MessageCircle } from 'lucide-react';
import { ministryInfo } from '../data/mock';
import { toast } from 'sonner';
import { submitContact } from '../services/api';

const Contact = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitContact(contactForm);
      toast.success('Message sent successfully! We will get back to you soon.');
      setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again or contact us directly.');
      console.error('Contact form error:', error);
    }
  };

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Contact <span className="text-amber-400">Us</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            We'd love to hear from you! Whether you have questions, need prayer, 
            or want to learn more about our ministry, we're here for you.
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">
                Get in <span className="text-amber-400">Touch</span>
              </h2>
              
              <div className="space-y-6 mb-12">
                <div className="flex items-start space-x-4 p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-amber-500/50 transition-all">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-amber-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email Us</h3>
                    <a href={`mailto:${ministryInfo.contact.email}`} className="text-slate-400 hover:text-amber-400 transition-colors">
                      {ministryInfo.contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-amber-500/50 transition-all">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-amber-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Visit Us</h3>
                    <p className="text-slate-400">{ministryInfo.contact.address}</p>
                  </div>
                </div>
              </div>

              {/* Office Hours */}
              <div className="bg-gradient-to-br from-slate-900 via-amber-900/10 to-slate-900 border border-amber-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Office Hours</h3>
                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span>Tuesday - Thursday:</span>
                    <span className="text-amber-400">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span className="text-amber-400">9:00 AM - 1:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday & Monday:</span>
                    <span className="text-slate-500">Closed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <MessageCircle className="text-amber-400" size={28} />
                  <h2 className="text-2xl font-bold text-white">Send Us a Message</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-white font-semibold mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactForm.name}
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
                        value={contactForm.email}
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
                        value={contactForm.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                        placeholder="(804) 555-0100"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-white font-semibold mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="volunteer">Volunteer Opportunities</option>
                      <option value="donation">Donation Questions</option>
                      <option value="prayer">Prayer Request</option>
                      <option value="encounters">Encounter Series</option>
                      <option value="assistance">Need Assistance</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-white font-semibold mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={contactForm.message}
                      onChange={handleInputChange}
                      required
                      rows="5"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors resize-none"
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold text-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/30 flex items-center justify-center"
                  >
                    <Send className="mr-2" size={20} />
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Find <span className="text-amber-400">Us</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Located in Richmond, serving Richmond and Henrico communities
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden" style={{ height: '400px' }}>
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
              <div className="text-center">
                <MapPin className="text-amber-400 mx-auto mb-4" size={48} />
                <p className="text-white font-semibold mb-2">Richmond, Virginia</p>
                <p className="text-slate-400 text-sm">Contact us for specific location details</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Looking for Something <span className="text-amber-400">Specific?</span>
          </h2>
          <p className="text-slate-300 mb-10">Quick links to help you find what you need</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <a 
              href="/prayer-requests" 
              className="p-6 bg-slate-900 border border-slate-800 rounded-lg hover:border-amber-500/50 transition-all text-center"
            >
              <h3 className="text-white font-semibold mb-2">Submit Prayer Request</h3>
              <p className="text-slate-400 text-sm">We're here to pray with you</p>
            </a>
            
            <a 
              href="/get-involved" 
              className="p-6 bg-slate-900 border border-slate-800 rounded-lg hover:border-amber-500/50 transition-all text-center"
            >
              <h3 className="text-white font-semibold mb-2">Volunteer Sign-Up</h3>
              <p className="text-slate-400 text-sm">Join our serving team</p>
            </a>
            
            <a 
              href="/donate" 
              className="p-6 bg-slate-900 border border-slate-800 rounded-lg hover:border-amber-500/50 transition-all text-center"
            >
              <h3 className="text-white font-semibold mb-2">Make a Donation</h3>
              <p className="text-slate-400 text-sm">Support our mission</p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
