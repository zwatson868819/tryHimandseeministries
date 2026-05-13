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
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminNews from './pages/AdminNews';
import AdminEncounters from './pages/AdminEncounters';
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
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/news" element={<AdminNews />} />
          <Route path="/admin/encounters" element={<AdminEncounters />} />
        </Routes>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
