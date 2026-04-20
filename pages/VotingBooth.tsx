import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDocs,
  serverTimestamp,
  increment,
  updateDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Candidate, Position, Election } from '../types';
import { CheckCircle, XCircle, ShieldCheck, Loader2, Info, Vote as VoteIcon, ChevronRight } from 'lucide-react';

const VotingBooth: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeElection, setActiveElection] = useState<Election | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({}); // positionId: candidateId
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
        setLoading(false);
      }
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubElection();
      unsubUsers();
    };
  }, [user, navigate]);

  useEffect(() => {
    if (!activeElection || !user) return;

    const unsubPositions = onSnapshot(
      query(collection(db, 'positions'), where('electionId', '==', activeElection.id)),
      (snap) => {
        setPositions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Position)));
      }
    );

    const unsubCandidates = onSnapshot(
      query(collection(db, 'candidates'), where('electionId', '==', activeElection.id), where('isDisqualified', '==', false)),
      (snap) => {
        setCandidates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Candidate)));
      }
    );

    setLoading(false);
    return () => {
      unsubPositions();
      unsubCandidates();
    };
  }, [activeElection, user]);

  const handleVoteSelect = (positionId: string, candidateId: string) => {
    setVotes(prev => ({ ...prev, [positionId]: candidateId }));
  };

  const handleSubmitVotes = async () => {
    if (!user || !activeElection) return;
    
    if (Object.keys(votes).length < positions.length) {
      if (!window.confirm('You haven\'t voted for all positions. Proceed anyway?')) return;
    }

    setSubmitting(true);
    try {
      for (const [positionId, candidateId] of Object.entries(votes)) {
        const voteId = `${user.uid}_${positionId}_${activeElection.id}`;
        
        await setDoc(doc(db, 'votes', voteId), {
          id: voteId,
          userId: user.uid,
          electionId: activeElection.id,
          positionId,
          candidateId,
          createdAt: serverTimestamp()
        });

        // Increment candidate voteCount
        const targetCandidate = candidates.find(c => c.id === candidateId);
        if (targetCandidate) {
          await updateDoc(doc(db, 'candidates', targetCandidate.id), {
            voteCount: increment(1)
          });
        }
      }

      navigate('/success');
    } catch (error) {
      console.error('Voting error:', error);
      alert('An error occurred while submitting your votes. You might have already voted for some positions.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center min-h-[60vh] flex flex-col justify-center items-center">
    <Loader2 className="animate-spin text-kabarak-green mb-4 h-12 w-12" />
    <p className="text-gray-500 font-medium tracking-tight">Authenticating Digital Ballot...</p>
  </div>;

  if (!activeElection) return (
    <div className="max-w-md mx-auto text-center py-20 px-6">
      <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
        <XCircle size={40} />
      </div>
      <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Election Vault Closed</h2>
      <p className="text-gray-500 mt-3 leading-relaxed">The voting platform is currently offline or the session has expired. Check institutional announcements for schedule.</p>
      <button onClick={() => navigate('/dashboard')} className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold">Return to Dashboard</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      <header className="text-center bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
        <div className="inline-flex items-center px-4 py-1.5 bg-kabarak-green/10 text-kabarak-green rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
          <ShieldCheck size={14} className="mr-2" />
          Secure 256-bit Encrypted Session
        </div>
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">{activeElection.title}</h1>
        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm">{activeElection.year} Academic Cycle</p>
        
        <div className="mt-8 flex items-center justify-center space-x-3 text-xs text-slate-500 bg-slate-50 py-3 px-6 rounded-2xl w-fit mx-auto border border-slate-100 italic">
          <Info size={14} className="text-kabarak-gold" />
          <span>Select your candidates for each position below. Your vote is final once cast.</span>
        </div>
      </header>

      <div className="space-y-16">
        {positions.map((pos, idx) => {
          const posCandidates = candidates.filter(c => c.positionId === pos.id);
          return (
            <section key={pos.id} className="relative group">
              <div className="flex items-center space-x-6 mb-8">
                 <div className="flex items-center justify-center w-12 h-12 bg-kabarak-green text-white rounded-2xl font-black text-xl shadow-lg ring-4 ring-kabarak-green/5">
                   {idx + 1}
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{pos.title}</h2>
                    <p className="text-sm text-slate-400 font-medium">Choose one from the candidates below</p>
                 </div>
                 <div className="flex-grow h-px bg-slate-100"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posCandidates.map(c => {
                  const u = users.find(user => user.id === c.userId);
                  const isSelected = votes[pos.id] === c.id;
                  return (
                    <div 
                      key={c.id} 
                      onClick={() => handleVoteSelect(pos.id, c.id)}
                      className={`relative group cursor-pointer transition-all duration-500 rounded-[2.5rem] overflow-hidden border-2 flex flex-col ${
                        isSelected 
                        ? 'border-kabarak-green ring-8 ring-kabarak-green/5 shadow-2xl bg-white scale-[1.02]' 
                        : 'border-transparent bg-white hover:border-slate-200 shadow-sm hover:shadow-xl'
                      }`}
                    >
                      <div className="aspect-[5/4] overflow-hidden bg-slate-50 relative">
                        <img 
                          src={c.photoURL || `https://picsum.photos/seed/${c.id}/400/300`} 
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover transition-all duration-1000 ${isSelected ? 'scale-110 grayscale-0' : 'scale-100 grayscale-[20%] group-hover:scale-105 group-hover:grayscale-0'}`} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        
                        {isSelected && (
                          <div className="absolute top-4 right-4 bg-kabarak-green text-white p-2 rounded-2xl shadow-2xl animate-in zoom-in duration-300">
                            <CheckCircle size={28} />
                          </div>
                        )}

                        <div className="absolute bottom-6 left-6">
                          <p className="text-white font-black text-xl leading-none mb-1">{u?.name}</p>
                          <p className="text-kabarak-gold font-bold text-[10px] uppercase tracking-widest">{u?.admissionNumber}</p>
                        </div>
                      </div>
                      <div className="p-8 flex-grow flex flex-col">
                        <p className="text-sm text-slate-500 line-clamp-4 leading-relaxed font-medium italic relative">
                           <span className="text-4xl text-kabarak-gold absolute -top-4 -left-2 opacity-20">"</span>
                           {c.bio || "Candidate has not provided a manifesto summary."}
                        </p>
                        <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                           <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-kabarak-green' : 'text-slate-300'}`}>
                             {isSelected ? 'Confirmed Choice' : 'Select Candidate'}
                           </span>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-kabarak-green text-white rotate-90' : 'bg-slate-50 text-slate-300'}`}>
                             <ChevronRight size={18} />
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-8 z-50 pointer-events-none">
        <div className="max-w-xl mx-auto flex items-center justify-between bg-white/80 backdrop-blur-3xl p-4 pl-10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,100,0,0.3)] border border-white pointer-events-auto">
          <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
             <p className="text-lg font-black text-kabarak-green">{Object.keys(votes).length} / {positions.length} Cast</p>
          </div>
          <button 
            onClick={handleSubmitVotes}
            disabled={submitting || Object.keys(votes).length === 0}
            className="group relative bg-kabarak-green text-white px-10 py-5 rounded-[2rem] font-black text-sm shadow-xl hover:shadow-2xl hover:bg-green-800 transition-all transform active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center overflow-hidden"
          >
            {submitting ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : (
              <>
                <span className="relative z-10">Cast My Final Vote</span>
                <VoteIcon className="ml-3 relative z-10 w-5 h-5 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotingBooth;
