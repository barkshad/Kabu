import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockSupabase } from '../services/mockSupabase';
import { useSiteConfig } from '../contexts/ConfigContext';
import { Profile } from '../types';
import { Vote, FileText, ShieldCheck, AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { config } = useSiteConfig();
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
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome, {user.full_name}</h1>
          <p className="text-gray-500 font-medium">Registration No: <span className="font-mono text-kabarak-green bg-green-50 px-2 py-1 rounded-md">{user.registration_number || 'N/A'}</span></p>
        </div>
        <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-kabarak-green">
                <span className="w-2 h-2 bg-kabarak-green rounded-full mr-2 animate-pulse"></span>
                Voting Active
            </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Status Card */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl border-l-8 border-kabarak-gold overflow-hidden h-full flex flex-col relative">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Vote size={120} />
             </div>
            <div className="p-8 flex-grow relative z-10">
              <div className="flex items-start mb-8">
                <div className="p-4 bg-yellow-50 rounded-2xl mr-5 shadow-sm">
                  <AlertTriangle className="w-8 h-8 text-kabarak-gold" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Action Required</h2>
                  <p className="text-gray-600 mt-2 leading-relaxed">{config.welcomeMessage}</p>
                </div>
              </div>
              
              <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100 mb-8 backdrop-blur-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-kabarak-green" />
                  Administrator Announcement
                </h3>
                <p className="text-sm text-gray-600 italic">"{config.announcement}"</p>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
              <button
                onClick={() => navigate('/booth')}
                className="w-full bg-kabarak-green hover:bg-[#005500] text-white text-lg font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex justify-center items-center group"
              >
                <Vote className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                Enter Voting Booth
              </button>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-kabarak-green to-[#004d00] text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <h3 className="font-bold text-xl mb-6 relative z-10">Election Timeline</h3>
            <div className="space-y-6 relative z-10">
              <div className="relative pl-6 border-l-2 border-white/20">
                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-kabarak-gold rounded-full border-2 border-green-800"></div>
                <p className="text-xs text-kabarak-gold font-bold uppercase tracking-wider">08:00 AM</p>
                <p className="text-base font-medium">Polls Open</p>
              </div>
              <div className="relative pl-6 border-l-2 border-white/20">
                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                <p className="text-xs text-kabarak-gold font-bold uppercase tracking-wider">Now</p>
                <p className="text-base font-bold text-white">Voting in Progress</p>
              </div>
              <div className="relative pl-6 border-l-2 border-white/20">
                 <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-gray-400 rounded-full border-2 border-green-800"></div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">05:00 PM</p>
                <p className="text-base text-white/60">Polls Close</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
             <h3 className="font-bold text-gray-900 mb-4 flex items-center">
               <FileText className="w-5 h-5 mr-2 text-gray-400" />
               Voter Resources
             </h3>
             <ul className="space-y-3 text-sm">
               <li><a href="#" className="flex items-center text-gray-600 hover:text-kabarak-green transition-colors font-medium group"><span className="w-1 h-1 bg-gray-300 rounded-full mr-2 group-hover:bg-kabarak-green"></span> Download {config.academicYear} Voter Guide</a></li>
               <li><a href="#" className="flex items-center text-gray-600 hover:text-kabarak-green transition-colors font-medium group"><span className="w-1 h-1 bg-gray-300 rounded-full mr-2 group-hover:bg-kabarak-green"></span> Constitution & Bylaws</a></li>
               <li><a href={`mailto:${config.contactEmail}`} className="flex items-center text-gray-600 hover:text-kabarak-green transition-colors font-medium group"><span className="w-1 h-1 bg-gray-300 rounded-full mr-2 group-hover:bg-kabarak-green"></span> Contact Electoral Commission</a></li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
