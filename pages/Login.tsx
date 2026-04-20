import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, UserPlus, LogIn, Key } from 'lucide-react';

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        // Register logic
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create profile
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          name,
          email,
          admissionNumber,
          role: 'student' // Default role
        });
      } else {
        // Login logic
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use.');
      } else {
        setError('Authentication failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-kabarak-green relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#FFD700] rounded-full blur-[150px]"></div>
         <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-white rounded-full blur-[150px]"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border-4 border-[#FFD700] shadow-2xl mb-4">
              <span className="text-kabarak-green font-serif font-bold text-4xl">K</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">Kabarak University</h1>
            <p className="text-[#FFD700] uppercase tracking-widest text-sm font-bold mt-1">Voting & Governance Portal</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-md font-bold text-gray-800 flex items-center">
                {isRegistering ? <UserPlus className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                {isRegistering ? 'Account Registration' : 'Secure Login'}
              </h2>
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs text-kabarak-green font-bold hover:underline"
              >
                {isRegistering ? 'Back to Login' : 'Create Account'}
              </button>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1 ml-1 text-left">Full Name</label>
                      <input
                        type="text"
                        required
                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kabarak-green outline-none transition-all"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1 ml-1 text-left">Admission Number</label>
                      <input
                        type="text"
                        required
                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kabarak-green outline-none transition-all"
                        placeholder="BCS/0000/20XX"
                        value={admissionNumber}
                        onChange={(e) => setAdmissionNumber(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1 ml-1 text-left">University Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kabarak-green outline-none transition-all"
                      placeholder="student@kabarak.ac.ke"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1 ml-1 text-left">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Key className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kabarak-green outline-none transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center text-red-700 text-xs">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-kabarak-green hover:bg-green-800 transition-all transform active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      {isRegistering ? 'Create Student Account' : 'Sign In to Portal'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
            <div className="bg-gray-50 px-8 py-3 text-center border-t border-gray-100 italic text-[10px] text-gray-400">
               Official Kabarak University Voting Platform &copy; {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
