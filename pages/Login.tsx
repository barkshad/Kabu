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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-kabarak-green via-[#005500] to-green-900 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-kabarak-gold rounded-full blur-[150px]"></div>
         <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-white rounded-full blur-[150px]"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white border-4 border-kabarak-gold shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-500">
              <span className="text-kabarak-green font-serif font-bold text-5xl">K</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md">Kabarak University</h1>
            <div className="flex items-center justify-center mt-3 space-x-2">
                <span className="h-px w-8 bg-kabarak-gold/70"></span>
                <p className="text-kabarak-gold uppercase tracking-[0.2em] text-sm font-bold">Elections 2026</p>
                <span className="h-px w-8 bg-kabarak-gold/70"></span>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center justify-center">
                <Lock className="w-4 h-4 mr-2 text-kabarak-green" />
                Secure Student Portal
              </h2>
            </div>
            
            <div className="p-8">
              <p className="text-gray-600 mb-8 text-center text-sm leading-relaxed">
                Welcome to the 2026 Student Council Elections. verify your identity to access the digital ballot.
              </p>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">
                    University Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-kabarak-green transition-colors" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kabarak-green focus:border-transparent transition-all outline-none font-medium text-gray-800 placeholder-gray-400"
                      placeholder="student@kabarak.ac.ke"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center ml-1">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Authorized domain: <span className="font-mono text-kabarak-green font-bold ml-1">@kabarak.ac.ke</span>
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50/80 border border-red-200 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
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
                  className={`w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-kabarak-green to-[#005500] hover:from-[#005500] hover:to-kabarak-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kabarak-green transition-all transform hover:scale-[1.02] active:scale-[0.98] ${loading ? 'opacity-75 cursor-wait' : ''}`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Enter Voting Booth
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
            <div className="bg-gray-50/80 px-8 py-4 text-center border-t border-gray-100">
               <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">256-bit Encrypted Connection</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Simple Footer for Login */}
      <div className="py-8 text-center text-white/50 text-xs relative z-10">
        &copy; 2026 Kabarak University ICT Department
      </div>
    </div>
  );
};

export default Login;