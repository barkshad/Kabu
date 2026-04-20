import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, UserPlus, Key } from 'lucide-react';

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
    <div className="flex flex-col min-h-screen bg-gray-50 relative">
      <div className="flex-1 flex flex-col justify-center items-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 overflow-hidden p-2">
                <img src="/logo.png" alt="Kabarak University Logo" className="w-full h-full object-contain drop-shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-kabarak-green font-bold text-4xl font-serif">K</span>';}} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-kabarak-darkGreen">Kabarak University</h1>
            <p className="text-kabarak-green uppercase tracking-wide text-xs font-semibold mt-2">Voting & Governance Portal</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center tracking-tight">
                {isRegistering ? <UserPlus className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                {isRegistering ? 'Account Registration' : 'Secure Login'}
              </h2>
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs text-kabarak-green font-medium hover:underline"
              >
                {isRegistering ? 'Back to Login' : 'Create Account'}
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {isRegistering && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-kabarak-green focus:border-kabarak-green outline-none text-sm transition-colors"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Admission Number</label>
                      <input
                        type="text"
                        required
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-kabarak-green focus:border-kabarak-green outline-none text-sm transition-colors"
                        placeholder="BCS/0000/20XX"
                        value={admissionNumber}
                        onChange={(e) => setAdmissionNumber(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">University Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-kabarak-green focus:border-kabarak-green outline-none text-sm transition-colors"
                      placeholder="student@kabarak.ac.ke"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-kabarak-green focus:border-kabarak-green outline-none text-sm transition-colors"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-md flex items-center text-red-700 text-xs">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2 px-4 rounded-md text-sm font-semibold text-white bg-kabarak-green hover:bg-kabarak-darkGreen transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <>
                      {isRegistering ? 'Create Student Account' : 'Sign In to Portal'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
            <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-200 text-xs text-gray-500">
               Official Kabarak University Voting Platform &copy; {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
