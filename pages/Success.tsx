import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockSupabase } from '../services/mockSupabase';
import { CheckCircle, LogOut, Copy } from 'lucide-react';

const Success: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<string>('');

  useEffect(() => {
    const user = mockSupabase.getCurrentUser();
    if (!user) { navigate('/login'); return; }
    if (!user.has_voted) { navigate('/dashboard'); return; }

    const stateReceipt = location.state?.receipt;
    if (stateReceipt) {
        setReceipt(stateReceipt);
    } else {
        setReceipt(`KAB-${user.id.substring(0,4).toUpperCase()}-RECOVERED`);
    }
  }, [navigate, location.state]);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-lg w-full text-center relative">
        <div className="h-3 bg-kabarak-green w-full absolute top-0"></div>
        
        <div className="p-10">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50/50">
            <CheckCircle className="w-12 h-12 text-kabarak-green" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vote Cast Successfully!</h1>
          <p className="text-gray-600 mb-8">Thank you for exercising your democratic right in the 2024 Student Council Elections.</p>

          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 mb-8 relative group">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">Transaction ID</p>
            <div className="font-mono text-xl md:text-2xl font-bold text-gray-800 break-all select-all">
              {receipt}
            </div>
            <p className="text-xs text-gray-400 mt-2">Please save this ID for your records.</p>
          </div>

          <button 
            onClick={() => mockSupabase.signOut().then(() => navigate('/login'))}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kabarak-green w-full transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out Securely
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <img src="https://picsum.photos/100/40?random=logo" alt="Kabarak University" className="h-8 mx-auto opacity-50 grayscale" />
        </div>
      </div>
    </div>
  );
};

export default Success;
