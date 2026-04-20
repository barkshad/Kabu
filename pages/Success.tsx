import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ShieldCheck, Download, Home, ArrowRight } from 'lucide-react';

const Success: React.FC = () => {
  const location = useLocation();
  const timestamp = new Date().toLocaleString();

  return (
    <div className="max-w-xl mx-auto py-20 px-6 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative inline-block mb-10">
        <div className="absolute inset-0 bg-kabarak-green rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="relative w-24 h-24 bg-kabarak-green text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-3">
          <CheckCircle size={48} />
        </div>
      </div>

      <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Ballot Cast Successfully!</h1>
      <p className="text-gray-500 font-medium leading-relaxed mb-10 max-w-sm mx-auto">
        Your choices have been securely encrypted and transmitted to the official student governance ledger. 
        Thank you for exercising your right to vote.
      </p>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-10 text-left space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-gray-50">
           <span className="text-xs font-bold text-gray-400 uppercase">Confirmation Reference</span>
           <span className="text-sm font-mono font-bold text-kabarak-green">KV-{Math.random().toString(36).substring(2, 9).toUpperCase()}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-50">
           <span className="text-xs font-bold text-gray-400 uppercase">Transmission Time</span>
           <span className="text-sm font-bold text-gray-800">{timestamp}</span>
        </div>
        <div className="flex items-center space-x-2 pt-2 text-kabarak-gold">
           <ShieldCheck size={14} />
           <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Verified</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          to="/dashboard" 
          className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center group"
        >
          <Home size={18} className="mr-2" />
          Back to Dashboard
        </Link>
        <button 
          onClick={() => window.print()}
          className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center"
        >
          <Download size={18} className="mr-2" />
          Download Receipt
        </button>
      </div>

      <div className="mt-16 text-gray-400 text-xs flex items-center justify-center space-x-2">
         <span>Election Year: 2023/2024</span>
         <span>•</span>
         <span>Kabarak University Elections Board</span>
      </div>
    </div>
  );
};

export default Success;
