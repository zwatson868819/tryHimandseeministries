import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);
  const location = useLocation();
  let dropdownTimer = null;

  const navLinks = [
    { name: 'Home', path: '/' },
    { 
      name: 'About', 
      path: '/about',
      dropdown: [
        { name: 'About Us', path: '/about' },
        { name: 'News', path: '/news' }
      ]
    },
    { name: 'Ministries', path: '/ministries' },
    { name: 'Encounters', path: '/encounters' },
    { name: 'Blog', path: '/blog' },
    { name: 'Light a Candle', path: '/light-a-candle' },
    { name: 'Get Involved', path: '/get-involved' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="/images/header-logo.png" 
              alt="tryHimandsee Ministries" 
              className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-amber-400">tryHimandsee</h1>
              <p className="text-xs text-amber-200/80">ministries</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              link.dropdown ? (
                <div 
                  key={link.path}
                  className="relative"
                  onMouseEnter={() => {
                    if (dropdownTimer) clearTimeout(dropdownTimer);
                    setShowAboutDropdown(true);
                  }}
                  onMouseLeave={() => {
                    dropdownTimer = setTimeout(() => setShowAboutDropdown(false), 200);
                  }}
                >
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${
                      isActive(link.path) || location.pathname === '/news'
                        ? 'bg-amber-500 text-slate-900'
                        : 'text-amber-100 hover:bg-amber-500/10 hover:text-amber-300'
                    }`}
                  >
                    {link.name}
                    <ChevronDown size={16} className="ml-1" />
                  </button>
                  {showAboutDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-amber-500/20 rounded-lg shadow-xl overflow-hidden z-50">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setShowAboutDropdown(false)}
                          className={`block px-4 py-3 text-sm transition-colors ${
                            isActive(item.path)
                              ? 'bg-amber-500 text-slate-900 font-semibold'
                              : 'text-amber-100 hover:bg-amber-500/10 hover:text-amber-300'
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(link.path)
                      ? 'bg-amber-500 text-slate-900'
                      : 'text-amber-100 hover:bg-amber-500/10 hover:text-amber-300'
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}
            <Link
              to="/donate"
              className="ml-4 px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
            >
              Donate
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                link.dropdown ? (
                  <div key={link.path} className="space-y-1">
                    <div className="text-amber-400 font-semibold text-sm px-4 py-2">
                      {link.name}
                    </div>
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block px-8 py-2 rounded-lg text-sm transition-colors ${
                          isActive(item.path)
                            ? 'bg-amber-500 text-slate-900 font-semibold'
                            : 'text-amber-100 hover:bg-amber-500/10'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive(link.path)
                        ? 'bg-amber-500 text-slate-900'
                        : 'text-amber-100 hover:bg-amber-500/10'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              ))}
              <Link
                to="/donate"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold text-center hover:from-amber-400 hover:to-amber-500 transition-all"
              >
                Donate
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
