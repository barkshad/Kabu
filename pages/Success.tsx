import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockSupabase } from '../services/mockSupabase';

const Success: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<string>('');

  useEffect(() => {
    const user = mockSupabase.getCurrentUser();
    if (!user || !user.has_voted) {
        // If they haven't voted, go back to dash
        if (!user?.has_voted) navigate('/dashboard');
        // If not logged in, login
        if (!user) navigate('/login');
    }

    // Try getting receipt from router state, or fallback to a generated one if user is already marked voted (for demo robustness)
    const stateReceipt = location.state?.receipt;
    if (stateReceipt) {
        setReceipt(stateReceipt);
    } else {
        // Fallback for page reload
        setReceipt("RECOVERED-" + user?.id.substring(0,8).toUpperCase());
    }
  }, [navigate, location.state]);

  return (
    <div className="flex flex-col items-center justify-center pt-10 pb-20">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl text-center max-w-lg w-full border-t-8 border-kabarak-green">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-check text-4xl text-kabarak-green"></i>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Vote Cast Successfully!</h2>
        <p className="text-gray-600 mb-8">Thank you for participating in the Kabarak University Student Council Elections.</p>

        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-6 mb-8">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Digital Voting Receipt</p>
          <div className="font-mono text-2xl font-bold text-kabarak-green tracking-widest select-all">
            {receipt}
          </div>
          <p className="text-xs text-gray-400 mt-2">Keep this hash for your records.</p>
        </div>

        <button 
          onClick={() => mockSupabase.signOut().then(() => navigate('/login'))}
          className="text-kabarak-green font-semibold hover:underline"
        >
          Sign out safely
        </button>
      </div>
    </div>
  );
};

export default Success;