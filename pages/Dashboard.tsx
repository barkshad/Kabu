import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockSupabase } from '../services/mockSupabase';
import { Profile } from '../types';
import { Vote, FileText, ShieldCheck, AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = mockSupabase.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      if (currentUser.has_voted) {
        navigate('/success');
      }
      setUser(currentUser);
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user.full_name}</h1>
        <p className="text-gray-500 font-medium">Registration No: <span className="font-mono text-gray-700">{user.registration_number || 'N/A'}</span></p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Status Card */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border-l-8 border-kabarak-gold overflow-hidden h-full flex flex-col">
            <div className="p-8 flex-grow">
              <div className="flex items-start mb-6">
                <div className="p-3 bg-yellow-50 rounded-lg mr-4">
                  <AlertTriangle className="w-8 h-8 text-kabarak-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Action Required</h2>
                  <p className="text-gray-600 mt-1">You have not cast your vote for the 2024 Student Council Elections yet.</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mb-8">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-kabarak-green" />
                  Voting Instructions
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>You must vote for all 5 positions.</li>
                  <li>You can only select one candidate per position.</li>
                  <li>Once submitted, your vote is final and cannot be changed.</li>
                  <li>Your vote is anonymized upon submission.</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
              <button
                onClick={() => navigate('/booth')}
                className="w-full bg-kabarak-green hover:bg-green-800 text-white text-lg font-bold py-4 px-6 rounded-xl shadow-md transition-all transform hover:-translate-y-1 flex justify-center items-center"
              >
                <Vote className="w-6 h-6 mr-3" />
                Enter Voting Booth
              </button>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-kabarak-green text-white rounded-2xl p-6 shadow-md">
            <h3 className="font-bold text-lg mb-2">Election Timeline</h3>
            <div className="space-y-4 mt-4">
              <div className="relative pl-4 border-l-2 border-white/30">
                <p className="text-xs text-kabarak-gold font-bold uppercase">08:00 AM</p>
                <p className="text-sm">Polls Open</p>
              </div>
              <div className="relative pl-4 border-l-2 border-white/30">
                <p className="text-xs text-kabarak-gold font-bold uppercase">Now</p>
                <p className="text-sm font-semibold">Voting in Progress</p>
              </div>
              <div className="relative pl-4 border-l-2 border-white/30">
                <p className="text-xs text-kabarak-gold font-bold uppercase">05:00 PM</p>
                <p className="text-sm">Polls Close</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
             <h3 className="font-bold text-gray-900 mb-4 flex items-center">
               <FileText className="w-5 h-5 mr-2 text-gray-400" />
               Resources
             </h3>
             <ul className="space-y-3 text-sm">
               <li><a href="#" className="text-kabarak-green hover:underline">Download Voter Guide</a></li>
               <li><a href="#" className="text-kabarak-green hover:underline">View Constitution</a></li>
               <li><a href="#" className="text-kabarak-green hover:underline">Contact Electoral Commission</a></li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
