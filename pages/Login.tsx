import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockSupabase } from '../services/mockSupabase';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

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
          navigate('/success'); 
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('An unexpected system error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-kabarak-green to-green-900">
      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border-4 border-kabarak-gold shadow-2xl mb-4">
              <span className="text-kabarak-green font-serif font-bold text-4xl">K</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Kabarak University</h1>
            <p className="text-kabarak-gold uppercase tracking-widest text-sm font-semibold mt-2">Student Council Elections 2024</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-kabarak-green" />
                Secure Student Portal
              </h2>
            </div>
            
            <div className="p-8">
              <p className="text-gray-600 mb-6 text-sm">
                Please verify your identity using your university email address to access the digital ballot.
              </p>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    University Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kabarak-green focus:border-kabarak-green transition-all outline-none"
                      placeholder="student@kabarak.ac.ke"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Only emails ending in <span className="font-mono text-kabarak-green ml-1">@kabarak.ac.ke</span> are authorized.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-in fade-in slide-in-from-top-2">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <div className="ml-3">
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-kabarak-green hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kabarak-green transition-all transform hover:scale-[1.02] ${loading ? 'opacity-75 cursor-wait' : ''}`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                      Verifying Credentials...
                    </>
                  ) : (
                    <>
                      Verify & Proceed
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
            <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
               <p className="text-xs text-gray-400">Secure connection encrypted via TLS 1.3</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Simple Footer for Login */}
      <div className="py-6 text-center text-white/60 text-xs">
        &copy; {new Date().getFullYear()} Kabarak University ICT Department
      </div>
    </div>
  );
};

export default Login;
