import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Ministries from './pages/Ministries';
import Encounters from './pages/Encounters';
import GetInvolved from './pages/GetInvolved';
import Contact from './pages/Contact';
import Donate from './pages/Donate';
import PrayerRequests from './pages/PrayerRequests';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminNews from './pages/AdminNews';
import AdminEncounters from './pages/AdminEncounters';
import AdminBlog from './pages/AdminBlog';
import AdminSubscribers from './pages/AdminSubscribers';
import AdminTestimonies from './pages/AdminTestimonies';
import AdminLybtl from './pages/AdminLybtl';
import AdminLybtlContact from './pages/AdminLybtlContact';
import LightACandle from './pages/LightACandle';
import SparkleCursor from './components/SparkleCursor';
import KonamiCode from './components/KonamiCode';
import VerseShuffleButton from './components/VerseShuffleButton';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App bg-slate-950 min-h-screen">
        <Header />
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
        <Footer />
        <SparkleCursor />
        <KonamiCode />
        <VerseShuffleButton />
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
