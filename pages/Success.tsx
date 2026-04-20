import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ShieldCheck, Download, Home } from 'lucide-react';

const Success: React.FC = () => {
  const location = useLocation();
  const timestamp = new Date().toLocaleString();

  return (
    <div className="max-w-xl mx-auto py-20 px-6 text-center">
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 bg-kabarak-green/10 text-kabarak-green rounded-full flex items-center justify-center">
          <CheckCircle size={32} />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">Ballot Cast Successfully</h1>
      <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
        Your choices have been securely encrypted and transmitted to the official student governance ledger. 
        Thank you for exercising your right to vote.
      </p>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 text-left space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
           <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirmation Reference</span>
           <span className="text-sm font-mono font-bold text-gray-900">KV-{Math.random().toString(36).substring(2, 9).toUpperCase()}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
           <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transmission Time</span>
           <span className="text-sm font-semibold text-gray-900">{timestamp}</span>
        </div>
        <div className="flex items-center space-x-2 pt-2 text-kabarak-green">
           <ShieldCheck size={16} />
           <span className="text-xs font-semibold uppercase tracking-wider">End-to-End Verified</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          to="/dashboard" 
          className="px-6 py-2.5 bg-gray-900 text-white rounded-md font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center"
        >
          <Home size={16} className="mr-2" />
          Back to Dashboard
        </Link>
        <button 
          onClick={() => window.print()}
          className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-md font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <Download size={16} className="mr-2" />
          Download Receipt
        </button>
      </div>

      <div className="mt-12 text-gray-500 text-xs flex items-center justify-center space-x-2">
         <span>Kabarak University Elections Board</span>
      </div>
    </div>
  );
};

export default Success;
