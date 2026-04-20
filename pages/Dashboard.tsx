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
import { Election } from '../types';
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

  if (loading) return <div className="p-8 flex justify-center text-gray-500"><Loader2 className="animate-spin inline mr-2" /> Loading System Data...</div>;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start w-full">
           <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 border border-gray-200 px-2 py-1 rounded">Student Portal</span>
           <h1 className="text-2xl font-bold text-gray-900 text-center md:text-left">Welcome, {profile?.name}</h1>
           <p className="text-gray-600 mt-2 text-center md:text-left max-w-xl text-sm leading-relaxed">
              Verify your status and access the student governance election system. Actions taken in this portal are logged for integrity.
           </p>
           
           <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start w-full">
             <Link 
              to="/booth" 
              className="px-6 py-2 bg-kabarak-green text-white rounded-md font-semibold hover:bg-kabarak-darkGreen transition-colors flex items-center text-sm"
             >
               <Vote size={16} className="mr-2" /> Access Voting Booth
             </Link>
             {profile?.role === 'candidate' && (
               <div className="px-6 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-md font-semibold flex items-center text-sm">
                 <User size={16} className="mr-2 text-kabarak-gold" /> Candidate Status: Active
               </div>
             )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Election Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-fit">
           <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center border-b border-gray-100 pb-2">
             <Clock className="mr-2 text-gray-400" size={18} />
             System Status
           </h2>
           <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase">Current Election</p>
                <p className="font-bold text-gray-900 mt-1">{activeElection?.title || 'No active election'}</p>
                <p className="text-xs text-gray-600 mt-1">Academic Year: {activeElection?.year || 'N/A'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200 flex items-center justify-between">
                <div>
                   <p className="text-xs font-semibold text-gray-500 uppercase">Voting Period</p>
                   {activeElection?.isActive ? (
                     <p className="text-sm font-bold text-kabarak-green mt-1 flex items-center">
                        <span className="w-2 h-2 bg-kabarak-green rounded-full mr-2"></span>
                        Active
                     </p>
                   ) : (
                     <p className="text-sm font-bold text-gray-500 mt-1 flex items-center">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                        Closed
                     </p>
                   )}
                </div>
              </div>
           </div>
        </div>

        {/* Info & Integrity */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
           <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center border-b border-gray-100 pb-2">
             <ShieldCheck className="mr-2 text-gray-400" size={18} />
             System Integrity
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-2">
                 <h3 className="font-semibold text-gray-900 text-sm">Anonymized Ballots</h3>
                 <p className="text-sm text-gray-600 leading-relaxed">
                   Your specific vote is stored separately from your profile identity to ensure complete ballot secrecy. Auditing only verifies participation, not selection.
                 </p>
              </div>
              <div className="space-y-2">
                 <h3 className="font-semibold text-gray-900 text-sm">Single Vote Policy</h3>
                 <p className="text-sm text-gray-600 leading-relaxed">
                   The system strictly enforces one vote per position. Duplicate attempts are automatically rejected by database constraints.
                 </p>
              </div>
           </div>
           
           <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                 <Info size={16} className="text-gray-400" />
                 <p className="text-xs font-medium text-gray-600">Need administrative support? Contact ict@kabarak.ac.ke</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
