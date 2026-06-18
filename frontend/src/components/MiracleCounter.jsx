import React, { useState, useEffect, useRef } from 'react';
import { HandHeart, Sparkles, Gift, Heart } from 'lucide-react';
import { getImpactStats } from '../services/api';

// Animated number that counts up from 0 to `value` over `duration` ms.
const AnimatedNumber = ({ value, duration = 1400 }) => {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    startRef.current = null;
    const target = Number(value) || 0;
    const tick = (ts) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(Math.round(target * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
};

const MiracleCounter = () => {
  const [stats, setStats] = useState(null);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    getImpactStats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Hide entirely if all numbers are zero (admin hasn't set them yet).
  const totalSum =
    (stats?.lives_touched || 0) +
    (stats?.kits_given || 0) +
    (stats?.miracle_runs || 0) +
    (stats?.total_donations || 0);
  if (!stats || totalSum === 0) return null;

  const items = [
    { label: 'Lives Touched', value: stats.lives_touched, Icon: HandHeart, testid: 'impact-lives-touched' },
    { label: 'Hygiene Kits Given', value: stats.kits_given, Icon: Sparkles, testid: 'impact-kits-given' },
    { label: 'Miracle Runs Completed', value: stats.miracle_runs, Icon: Gift, testid: 'impact-miracle-runs' },
    { label: 'Donations Received', value: stats.total_donations, Icon: Heart, testid: 'impact-donations' },
  ];

  return (
    <section
      ref={sectionRef}
      data-testid="miracle-counter"
      className="py-16 bg-gradient-to-br from-slate-950 via-amber-900/10 to-slate-950 border-y border-amber-500/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-2">
            Random Blessings, Eternal Impact
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Miracles in <span className="text-amber-400">Motion</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ label, value, Icon, testid }) => (
            <div
              key={label}
              data-testid={testid}
              className="bg-slate-900/60 backdrop-blur border border-amber-500/20 rounded-xl p-6 text-center hover:border-amber-500/50 transition-all"
            >
              <Icon className="text-amber-400 mx-auto mb-3" size={28} />
              <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-1 tabular-nums">
                {visible ? <AnimatedNumber value={value} /> : 0}
              </div>
              <p className="text-slate-400 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MiracleCounter;
