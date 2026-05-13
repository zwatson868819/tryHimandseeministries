import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { adminLogin } from '../services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await adminLogin(credentials);
      localStorage.setItem('admin_token', response.access_token);
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error('Invalid username or password');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-950">
      <div className="max-w-md w-full mx-4">
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-amber-400" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin <span className="text-amber-400">Login</span>
            </h1>
            <p className="text-slate-400">
              Enter your credentials to access the admin dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-white text-sm font-semibold mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-slate-500" size={20} />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-white text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-slate-500" size={20} />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2" size={20} />
                  Login
                </>
              )}
            </button>
          </form>

          {/* Default Credentials Info */}
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-200 text-sm text-center">
              <span className="font-semibold">Your admin credentials:</span><br />
              Username: <span className="font-mono">zwatson</span><br />
              Password: <span className="font-mono">Anandotowel@1988*</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
