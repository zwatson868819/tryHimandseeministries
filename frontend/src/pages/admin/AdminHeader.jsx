import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, BookOpen, AtSign, Sparkles, HandHeart, LogOut } from 'lucide-react';

const NavButton = ({ onClick, icon: Icon, label, className, testId }) => (
  <button
    onClick={onClick}
    data-testid={testId}
    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${className}`}
  >
    <Icon className="mr-2" size={18} />
    {label}
  </button>
);

const AdminHeader = ({ onLogout }) => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Admin <span className="text-amber-400">Dashboard</span>
        </h1>
        <p className="text-slate-400">Manage your ministry data and settings</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <NavButton onClick={() => navigate('/admin/encounters')} icon={Newspaper} label="Manage Encounters"
          className="bg-blue-600 text-white hover:bg-blue-700" />
        <NavButton onClick={() => navigate('/admin/news')} icon={Newspaper} label="Manage News"
          className="bg-purple-600 text-white hover:bg-purple-700" />
        <NavButton onClick={() => navigate('/admin/blog')} testId="admin-manage-blog-btn" icon={BookOpen} label="Manage Notes"
          className="bg-emerald-600 text-white hover:bg-emerald-700" />
        <NavButton onClick={() => navigate('/admin/subscribers')} testId="admin-manage-subscribers-btn" icon={AtSign} label="Subscribers"
          className="bg-pink-600 text-white hover:bg-pink-700" />
        <NavButton onClick={() => navigate('/admin/testimonies')} testId="admin-manage-testimonies-btn" icon={Sparkles} label="Testimonies"
          className="bg-orange-600 text-white hover:bg-orange-700" />
        <NavButton onClick={() => navigate('/admin/lybtl')} testId="admin-manage-lybtl-btn" icon={HandHeart} label="Loving You Back To Life"
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold hover:from-amber-400 hover:to-amber-500" />
        <NavButton onClick={onLogout} icon={LogOut} label="Logout"
          className="bg-slate-800 text-white hover:bg-slate-700" />
      </div>
    </div>
  );
};

export default AdminHeader;
