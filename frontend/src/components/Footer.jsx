import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Heart, BookOpen, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { ministryInfo } from '../data/mock';
import { getVerseOfTheDay } from '../data/verses';
import { shareVerse } from '../lib/shareVerse';
import { DoveProgress } from './DoveHunt';

const Footer = () => {
  const verse = getVerseOfTheDay();

  const handleShare = async () => {
    try {
      const { method } = await shareVerse(verse);
      if (method === 'downloaded') {
        toast.success('Verse copied and quote card downloaded — share it anywhere!');
      } else if (method === 'shared') {
        toast.success('Thanks for sharing the Word!');
      }
    } catch {
      toast.error('Could not share the verse. Please try again.');
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Verse of the Day */}
        <div
          data-testid="verse-of-the-day"
          className="mb-10 bg-gradient-to-r from-amber-900/10 via-slate-900/50 to-amber-900/10 border border-amber-500/20 rounded-xl px-6 py-5 flex items-start gap-4"
        >
          <BookOpen className="text-amber-400 flex-shrink-0 mt-1" size={22} />
          <div className="flex-1">
            <p className="text-amber-400 text-xs uppercase tracking-widest font-semibold mb-2">
              Verse of the Day
            </p>
            <p className="text-slate-200 italic leading-relaxed">&ldquo;{verse.text}&rdquo;</p>
            <p className="text-amber-400 text-sm font-semibold mt-2">&mdash; {verse.ref}</p>
          </div>
          <button
            type="button"
            onClick={handleShare}
            data-testid="share-verse-btn"
            title="Share this verse"
            aria-label="Share this verse"
            className="flex-shrink-0 self-center px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 text-amber-400 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/images/header-logo.png" 
                alt="tHsm" 
                className="h-10 w-10 object-contain"
              />
              <h3 className="text-lg font-bold text-amber-400">tryHimandsee</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              {ministryInfo.mission}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-amber-400 font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-slate-400 hover:text-amber-300 text-sm transition-colors">About Us</Link></li>
              <li><Link to="/ministries" className="text-slate-400 hover:text-amber-300 text-sm transition-colors">Our Ministries</Link></li>
              <li><Link to="/encounters" className="text-slate-400 hover:text-amber-300 text-sm transition-colors">Encounters</Link></li>
              <li><Link to="/get-involved" className="text-slate-400 hover:text-amber-300 text-sm transition-colors">Get Involved</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-amber-400 font-semibold mb-4">Support Us</h4>
            <ul className="space-y-2">
              <li><Link to="/donate" className="text-slate-400 hover:text-amber-300 text-sm transition-colors">Make a Donation</Link></li>
              <li><Link to="/get-involved" className="text-slate-400 hover:text-amber-300 text-sm transition-colors">Volunteer</Link></li>
              <li><Link to="/prayer-requests" className="text-slate-400 hover:text-amber-300 text-sm transition-colors">Prayer Requests</Link></li>
              <li><Link to="/light-a-candle" className="text-slate-400 hover:text-amber-300 text-sm transition-colors">Light a Candle</Link></li>
              <li><Link to="/share" className="text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors">&rarr; Share the mission</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-amber-400 font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-slate-400 text-sm">
                <Mail size={16} className="mt-1 text-amber-400 flex-shrink-0" />
                <span>{ministryInfo.contact.email}</span>
              </li>
              <li className="flex items-start space-x-2 text-slate-400 text-sm">
                <MapPin size={16} className="mt-1 text-amber-400 flex-shrink-0" />
                <span>{ministryInfo.contact.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800">
          <DoveProgress />
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} tryHimandsee Ministries. All rights reserved.
            </p>
            <div className="flex items-center justify-center space-x-1 text-slate-500 text-sm mb-3">
              <span>Made with</span>
              <Heart size={14} className="text-amber-500 fill-amber-500" />
              <span>to serve His people</span>
            </div>
            <Link 
              to="/admin/login" 
              className="text-slate-600 hover:text-amber-400 text-xs transition-colors inline-block"
              title="Staff Login"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
