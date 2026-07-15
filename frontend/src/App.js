import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import SparkleCursor from './components/SparkleCursor';
import KonamiCode from './components/KonamiCode';
import VerseShuffleButton from './components/VerseShuffleButton';
import WorshipMusic from './components/WorshipMusic';
import './App.css';

// Lazy-loaded pages: only ship each page's JS to visitors when they actually navigate to it.
// This trims the initial bundle so first-page paint is much faster.
const About            = lazy(() => import('./pages/About'));
const Ministries       = lazy(() => import('./pages/Ministries'));
const Encounters       = lazy(() => import('./pages/Encounters'));
const GetInvolved      = lazy(() => import('./pages/GetInvolved'));
const Contact          = lazy(() => import('./pages/Contact'));
const Donate           = lazy(() => import('./pages/Donate'));
const PrayerRequests   = lazy(() => import('./pages/PrayerRequests'));
const News             = lazy(() => import('./pages/News'));
const NewsDetail       = lazy(() => import('./pages/NewsDetail'));
const Blog             = lazy(() => import('./pages/Blog'));
const BlogDetail       = lazy(() => import('./pages/BlogDetail'));
const LightACandle     = lazy(() => import('./pages/LightACandle'));
const ShareKit         = lazy(() => import('./pages/ShareKit'));
const Beatitudes       = lazy(() => import('./pages/Beatitudes'));
const Notary           = lazy(() => import('./pages/Notary'));
const ResourceDirectory = lazy(() => import('./pages/ResourceDirectory'));
const Voices           = lazy(() => import('./pages/Voices'));
const VoicesRecord     = lazy(() => import('./pages/VoicesRecord'));
const Mailbox          = lazy(() => import('./pages/Mailbox'));

// Admin bundle - only loaded when an admin logs in.
const AdminLogin        = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard    = lazy(() => import('./pages/AdminDashboard'));
const AdminNews         = lazy(() => import('./pages/AdminNews'));
const AdminEncounters   = lazy(() => import('./pages/AdminEncounters'));
const AdminBlog         = lazy(() => import('./pages/AdminBlog'));
const AdminSubscribers  = lazy(() => import('./pages/AdminSubscribers'));
const AdminTestimonies  = lazy(() => import('./pages/AdminTestimonies'));
const AdminLybtl        = lazy(() => import('./pages/AdminLybtl'));
const AdminLybtlContact = lazy(() => import('./pages/AdminLybtlContact'));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <div className="text-center">
      <div className="animate-spin h-10 w-10 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-3"></div>
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="App bg-slate-950 min-h-screen">
        <Header />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/ministries" element={<Ministries />} />
            <Route path="/encounters" element={<Encounters />} />
            <Route path="/get-involved" element={<GetInvolved />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/prayer-requests" element={<PrayerRequests />} />
            <Route path="/light-a-candle" element={<LightACandle />} />
            <Route path="/share" element={<ShareKit />} />
            <Route path="/beatitudes" element={<Beatitudes />} />
            <Route path="/notary" element={<Notary />} />
            <Route path="/resources/:category" element={<ResourceDirectory />} />
            <Route path="/voices" element={<Voices />} />
            <Route path="/voices/record" element={<VoicesRecord />} />
            <Route path="/mailbox/:code" element={<Mailbox />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/news" element={<AdminNews />} />
            <Route path="/admin/encounters" element={<AdminEncounters />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/subscribers" element={<AdminSubscribers />} />
            <Route path="/admin/testimonies" element={<AdminTestimonies />} />
            <Route path="/admin/lybtl" element={<AdminLybtl />} />
            <Route path="/admin/lybtl/:id" element={<AdminLybtlContact />} />
          </Routes>
        </Suspense>
        <Footer />
        <SparkleCursor />
        <KonamiCode />
        <VerseShuffleButton />
        <WorshipMusic />
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
