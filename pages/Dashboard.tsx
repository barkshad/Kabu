import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Election, Candidate, Position } from '../types';
import { 
  Vote, 
  Award, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  User,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [activeElection, setActiveElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const electionQuery = query(collection(db, 'elections'), where('isActive', '==', true));
    const unsubElection = onSnapshot(electionQuery, (snap) => {
      if (!snap.empty) {
        setActiveElection({ id: snap.docs[0].id, ...snap.docs[0].data() } as Election);
      } else {
        setActiveElection(null);
      }
      setLoading(false);
    });

    return () => unsubElection();
  }, [user, navigate]);

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading Dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-kabarak-green/5 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10 flex flex-col items-center md:items-start">
           <span className="bg-kabarak-gold/20 text-kabarak-green text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Official Student Portal</span>
           <h1 className="text-3xl font-extrabold text-gray-900 text-center md:text-left">Welcome Back, {profile?.name}!</h1>
           <p className="text-gray-500 mt-2 text-center md:text-left max-w-md">Your participation in student council elections shapes the future of Kabarak University's student governance.</p>
           
           <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
             <Link 
              to="/booth" 
              className="px-8 py-3 bg-kabarak-green text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center"
             >
               <Vote size={18} className="mr-2" /> Access Voting Booth
             </Link>
             {profile?.role === 'candidate' && (
               <div className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 flex items-center">
                 <User size={18} className="mr-2 text-kabarak-gold" /> Candidate Status: Active
               </div>
             )}
           </div>
        </div>
        <div className="hidden lg:block relative">
           <div className="bg-kabarak-gold/10 w-48 h-48 rounded-3xl rotate-12 flex items-center justify-center">
              <ShieldCheck size={100} className="text-kabarak-green -rotate-12" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Election Status */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">
           <h3 className="font-bold text-gray-800 mb-6 flex items-center">
             <Clock className="mr-2 text-kabarak-gold" size={20} />
             System Status
           </h3>
           <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase">Current Election</p>
                <p className="font-bold text-gray-900 mt-1">{activeElection?.title || 'No active election'}</p>
                <p className="text-xs text-gray-500 mt-1">{activeElection?.year}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold text-gray-400 uppercase">Voting Period</p>
                   {activeElection?.isActive ? (
                     <p className="text-sm font-bold text-green-600 mt-1">Live - Accepting Ballots</p>
                   ) : (
                     <p className="text-sm font-bold text-red-400 mt-1">Closed/Paused</p>
                   )}
                </div>
                {activeElection?.isActive && <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>}
              </div>
           </div>
        </div>

        {/* Info & Integrity */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
           <h3 className="font-bold text-gray-800 mb-6 flex items-center">
             <Award className="mr-2 text-kabarak-green" size={20} />
             Voting Integrity & Security
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <div className="w-10 h-10 bg-green-50 text-kabarak-green rounded-xl flex items-center justify-center mb-4">
                    <ShieldCheck size={20} />
                 </div>
                 <h4 className="font-bold text-gray-900">Anonymized Ballots</h4>
                 <p className="text-sm text-gray-500">Your specific vote is encrypted and stored separately from your profile identity to ensure complete ballot secrecy.</p>
              </div>
              <div className="space-y-2">
                 <div className="w-10 h-10 bg-gold-50 text-[#FFD700] rounded-xl flex items-center justify-center mb-4 bg-[#FFD700]/10">
                    <AlertCircle size={20} />
                 </div>
                 <h4 className="font-bold text-gray-900">Single Vote Policy</h4>
                 <p className="text-sm text-gray-500">The system strictly enforces one vote per position. Duplicate attempts are automatically blocked by blockchain-inspired hashing.</p>
              </div>
           </div>
           
           <div className="mt-8 p-4 bg-kabarak-green/5 rounded-2xl border border-kabarak-green/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                 <div className="p-2 bg-white rounded-lg shadow-sm">
                   <Info size={16} className="text-kabarak-green" />
                 </div>
                 <p className="text-xs font-medium text-gray-600">Need help? Email the support team at ict@kabarak.ac.ke</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
