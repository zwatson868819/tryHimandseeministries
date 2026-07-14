import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Globe, Clock, StickyNote, Home, Utensils, Shirt, Building2, HeartPulse, ShieldAlert, ArrowLeft } from 'lucide-react';
import PageMeta from '../components/PageMeta';
import { getResources } from '../services/api';

export const RESOURCE_CATEGORIES = [
  { key: 'housing',           label: 'Housing / Rental',                icon: Home,        color: 'from-sky-500 to-cyan-500' },
  { key: 'food',              label: 'Food',                             icon: Utensils,    color: 'from-amber-500 to-orange-500' },
  { key: 'clothing',          label: 'Clothing',                         icon: Shirt,       color: 'from-emerald-500 to-teal-500' },
  { key: 'social-services',   label: 'Social Services',                  icon: Building2,   color: 'from-indigo-500 to-purple-500' },
  { key: 'mental-health',     label: 'Mental / Behavioral Health',       icon: HeartPulse,  color: 'from-rose-500 to-pink-500' },
  { key: 'domestic-violence', label: 'Abuse / Domestic Violence',        icon: ShieldAlert, color: 'from-fuchsia-500 to-rose-500' },
];

const getCategory = (key) => RESOURCE_CATEGORIES.find((c) => c.key === key);

const normalizeUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

const mapsHref = (address) => {
  if (!address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
};

const telHref = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/[^0-9+]/g, '');
  return digits ? `tel:${digits}` : null;
};

const ResourceCard = ({ resource }) => {
  const map = mapsHref(resource.address);
  const tel = telHref(resource.phone);
  const web = normalizeUrl(resource.website);
  return (
    <article
      data-testid={`resource-card-${resource.id}`}
      className="bg-slate-900/80 border border-amber-500/20 rounded-xl p-6 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/10 transition-all"
    >
      <h3 className="text-white text-lg font-semibold mb-2 leading-snug">{resource.name}</h3>
      {resource.description && (
        <p className="text-slate-400 text-sm leading-relaxed mb-4">{resource.description}</p>
      )}
      <div className="space-y-2 text-sm">
        {resource.address && (
          <p className="flex items-start gap-2 text-slate-300">
            <MapPin size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            {map ? (
              <a href={map} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                {resource.address}
              </a>
            ) : (
              <span>{resource.address}</span>
            )}
          </p>
        )}
        {resource.phone && (
          <p className="flex items-start gap-2 text-slate-300">
            <Phone size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            {tel ? (
              <a href={tel} className="hover:text-amber-400 transition-colors">{resource.phone}</a>
            ) : (
              <span>{resource.phone}</span>
            )}
          </p>
        )}
        {resource.hours && (
          <p className="flex items-start gap-2 text-slate-300">
            <Clock size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <span>{resource.hours}</span>
          </p>
        )}
        {web && (
          <p className="flex items-start gap-2 text-slate-300">
            <Globe size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <a href={web} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors break-all">
              {web.replace(/^https?:\/\//, '')}
            </a>
          </p>
        )}
        {resource.notes && (
          <p className="flex items-start gap-2 text-slate-400 italic pt-2 border-t border-slate-800 mt-3">
            <StickyNote size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <span>{resource.notes}</span>
          </p>
        )}
      </div>
    </article>
  );
};

const ResourceDirectory = () => {
  const { category: categoryKey } = useParams();
  const category = getCategory(categoryKey);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!category) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getResources(category.key)
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError('We could not load the resource list right now. Please try again later.'))
      .finally(() => setLoading(false));
  }, [category]);

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24" data-testid="resource-directory-invalid">
        <div className="max-w-3xl mx-auto text-center py-24 px-4">
          <h1 className="text-3xl font-bold text-white mb-4">Category not found</h1>
          <p className="text-slate-400 mb-6">Please choose a category from the Resource Directory dropdown.</p>
          <Link to="/" className="text-amber-400 hover:text-amber-300 underline">Return home</Link>
        </div>
      </div>
    );
  }

  const Icon = category.icon;

  return (
    <div className="min-h-screen bg-slate-950 pt-24" data-testid="resource-directory-page">
      <PageMeta
        title={`${category.label} Resources — Richmond & Henrico`}
        description={`Real, verified ${category.label.toLowerCase()} resources in Richmond and Henrico, Virginia — curated by tryHimandsee Ministries.`}
        path={`/resources/${category.key}`}
      />

      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-slate-950 via-amber-900/10 to-slate-950 border-b border-amber-500/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            data-testid="resource-back-home"
            className="inline-flex items-center text-slate-400 hover:text-amber-400 text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
              <Icon className="text-white" size={26} />
            </div>
            <div>
              <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-1">Resource Directory</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">{category.label}</h1>
            </div>
          </div>
          <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed">
            Curated organizations serving <strong className="text-amber-300">Richmond &amp; Henrico, Virginia</strong>. Please call ahead to confirm hours and eligibility — some listings require appointments or referrals.
          </p>
        </div>
      </section>

      {/* Category quick-switch */}
      <section className="bg-slate-900/50 border-b border-slate-800 sticky top-[72px] z-30 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {RESOURCE_CATEGORIES.map((c) => {
              const active = c.key === category.key;
              const CIcon = c.icon;
              return (
                <Link
                  key={c.key}
                  to={`/resources/${c.key}`}
                  data-testid={`resource-tab-${c.key}`}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    active
                      ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-amber-300'
                  }`}
                >
                  <CIcon size={14} />
                  {c.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Resource cards */}
      <section className="py-12 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <p data-testid="resource-loading" className="text-slate-400 text-center py-12">Loading resources…</p>
          )}
          {error && (
            <p data-testid="resource-error" className="text-rose-400 text-center py-12">{error}</p>
          )}
          {!loading && !error && items.length === 0 && (
            <p data-testid="resource-empty" className="text-slate-400 text-center py-12">
              No resources yet in this category. Check back soon.
            </p>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-5" data-testid="resource-list">
            {items.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>

          {!loading && !error && items.length > 0 && (
            <p className="text-slate-500 text-xs text-center mt-10 max-w-2xl mx-auto">
              This directory is maintained by tryHimandsee Ministries. Listings are provided as a public service; we do not endorse or guarantee services provided by third-party organizations. If a listing is outdated, please <Link to="/contact" className="text-amber-400 hover:underline">let us know</Link>.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ResourceDirectory;
