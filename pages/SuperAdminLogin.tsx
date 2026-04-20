import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const SuperAdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // Using Firestore to persist list of allowed admins would be better, but mock with local storage for now
  const [allowedAdmins] = useState(['barakashadrack0@gmail.com']); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Hardcoded check
    if (email === 'barakashadrack0@gmail.com' && password === 'baraka') {
       localStorage.setItem('adminRole', 'admin_super');
       navigate('/admin/advanced');
    } else {
       setError('Invalid credentials.');
       setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-bold text-red-900 mb-6 text-center">Super Admin Vault</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input type="email" required className="w-full px-3 py-2 border rounded-md" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" required className="w-full px-3 py-2 border rounded-md" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <div className="text-red-600 text-xs flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-2 bg-red-900 text-white rounded-md font-bold">
            {loading ? <Loader2 className="animate-spin mx-auto w-4 h-4" /> : 'Enter Vault'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
