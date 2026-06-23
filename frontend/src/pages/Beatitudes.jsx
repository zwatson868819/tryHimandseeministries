import React, { useEffect, useRef, useState } from 'react';
import { Mountain } from 'lucide-react';
import PageMeta from '../components/PageMeta';

// Matthew 5:3-12, the eight Beatitudes from the Sermon on the Mount.
const BEATITUDES = [
  {
    text: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.',
    ref: 'Matthew 5:3',
    reflection: 'To be poor in spirit is to come to God with empty hands, knowing we have nothing to offer but our need. He fills the empty.',
  },
  {
    text: 'Blessed are those who mourn, for they shall be comforted.',
    ref: 'Matthew 5:4',
    reflection: 'God draws near in our grief. No tear falls without His attention. The path through sorrow is a path toward His tender comfort.',
  },
  {
    text: 'Blessed are the meek, for they shall inherit the earth.',
    ref: 'Matthew 5:5',
    reflection: 'Meekness is strength surrendered. The gentle, the un-proud, the un-grasping, these are the ones to whom the Father quietly gives everything.',
  },
  {
    text: 'Blessed are those who hunger and thirst for righteousness, for they shall be filled.',
    ref: 'Matthew 5:6',
    reflection: 'The deep ache for things to be right, for justice, for holiness, God Himself plants this hunger, and He alone satisfies it.',
  },
  {
    text: 'Blessed are the merciful, for they shall obtain mercy.',
    ref: 'Matthew 5:7',
    reflection: 'Mercy creates an open circuit. What we extend, we receive back, multiplied. The merciful live in mercy&rsquo;s atmosphere.',
  },
  {
    text: 'Blessed are the pure in heart, for they shall see God.',
    ref: 'Matthew 5:8',
    reflection: 'Purity of heart is singleness of love, to want one thing: Him. To the undivided heart, God becomes visible everywhere.',
  },
  {
    text: 'Blessed are the peacemakers, for they shall be called sons of God.',
    ref: 'Matthew 5:9',
    reflection: 'Peacemaking is family resemblance to the Father. To carry calm into chaos is to wear the Son&rsquo;s name in public.',
  },
  {
    text: 'Blessed are those who are persecuted for righteousness&rsquo; sake, for theirs is the kingdom of heaven.',
    ref: 'Matthew 5:10',
    reflection: 'When standing for Christ costs you, you stand in good company with every saint and prophet. The kingdom is not just promised, it is already yours.',
  },
];

const Beatitude = ({ b, index }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      data-testid={`beatitude-${index + 1}`}
      className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16"
    >
      <div
        className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">
          Beatitude {index + 1} of {BEATITUDES.length}
        </p>
        <h2
          className="text-2xl sm:text-3xl md:text-4xl text-white italic font-light leading-relaxed mb-6"
          dangerouslySetInnerHTML={{ __html: `&ldquo;${b.text}&rdquo;` }}
        />
        <p className="text-amber-400 font-semibold mb-10">&mdash; {b.ref}</p>
        <div className="mx-auto w-24 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mb-8" />
        <p
          className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto"
          dangerouslySetInnerHTML={{ __html: b.reflection }}
        />
      </div>
    </section>
  );
};

const Beatitudes = () => (
  <div className="min-h-screen bg-gradient-to-b from-slate-950 via-amber-950/10 to-slate-950">
    <PageMeta
      title="Walking the Beatitudes"
      description="A scroll-driven meditation through the eight Beatitudes from the Sermon on the Mount. Pause, read, and let each blessing breathe."
      path="/beatitudes"
    />

    {/* Hero */}
    <section className="pt-32 pb-16 text-center px-4">
      <Mountain className="text-amber-400 mx-auto mb-4" size={40} />
      <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">
        The Sermon on the Mount
      </p>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
        Walking the <span className="text-amber-400">Beatitudes</span>
      </h1>
      <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
        Scroll slowly. Let each blessing breathe. Eight quiet steps into the heart of the kingdom.
      </p>
      <div className="mt-12 text-slate-500 text-sm animate-bounce">↓ Scroll to begin</div>
    </section>

    {BEATITUDES.map((b, i) => (
      <Beatitude key={b.ref} b={b} index={i} />
    ))}

    {/* Closing */}
    <section className="py-20 text-center px-4 bg-gradient-to-b from-transparent to-slate-950">
      <div className="max-w-2xl mx-auto">
        <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">
          The end of the climb
        </p>
        <p className="text-white text-xl italic leading-relaxed mb-6">
          &ldquo;Rejoice and be exceeding glad, for great is your reward in heaven.&rdquo;
        </p>
        <p className="text-amber-400 font-semibold">&mdash; Matthew 5:12</p>
      </div>
    </section>
  </div>
);

export default Beatitudes;
