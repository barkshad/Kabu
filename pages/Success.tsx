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
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden max-w-lg w-full text-center relative border border-gray-100">
        <div className="h-4 bg-gradient-to-r from-kabarak-green to-kabarak-gold w-full absolute top-0"></div>
        
        <div className="p-10 md:p-12">
          <div className="w-28 h-28 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-green-50/50 shadow-inner">
            <CheckCircle className="w-16 h-16 text-kabarak-green" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Vote Confirmed!</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">Thank you for exercising your democratic right in the <span className="font-bold text-gray-800">2026 Student Council Elections</span>.</p>

          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 mb-8 relative group hover:border-kabarak-green/50 transition-colors">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Official Transaction ID</p>
            <div className="font-mono text-xl md:text-2xl font-bold text-gray-800 break-all select-all tracking-wide">
              {receipt}
            </div>
            <p className="text-xs text-gray-400 mt-3 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                Securely Recorded on Ledger
            </p>
          </div>

          <button 
            onClick={() => mockSupabase.signOut().then(() => navigate('/login'))}
            className="inline-flex items-center justify-center px-6 py-4 border border-gray-200 shadow-sm text-base font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kabarak-green w-full transition-all hover:shadow-md"
          >
            <LogOut className="w-5 h-5 mr-2 text-gray-500" />
            Sign Out Securely
          </button>
        </div>
        
        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
           <p className="text-xs text-gray-400 font-medium">Kabarak University &bull; Elections 2026</p>
        </div>
      </div>
    </div>
  );
};

export default Success;