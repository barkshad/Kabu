import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockSupabase } from '../services/mockSupabase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { user, error } = await mockSupabase.signIn(email);
      if (error) {
        setError(error);
      } else if (user) {
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.has_voted) {
          // If already voted, maybe send to success page to see receipt or just dashboard which handles "already voted" state
          navigate('/success'); 
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md border-t-4 border-kabarak-gold">
        <div className="p-8">
          <div className="text-center mb-8">
             <i className="fas fa-university text-5xl text-kabarak-green mb-4"></i>
             <h2 className="text-2xl font-bold text-gray-800">Student Portal Login</h2>
             <p className="text-gray-500 mt-2">Enter your university email to proceed.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                University Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-gray-400"></i>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-kabarak-green focus:border-kabarak-green transition-colors"
                  placeholder="student@kabarak.ac.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Must end with @kabarak.ac.ke</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-exclamation-circle text-red-500"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-kabarak-green hover:bg-kabarak-darkGreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kabarak-green transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin mr-2"></i> Verifying...
                </>
              ) : (
                'Access Voting Booth'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400">
            <p>Protected by Kabarak University IT Security</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;