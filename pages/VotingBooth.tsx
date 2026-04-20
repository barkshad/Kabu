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
      if (!window.confirm('You haven\'t voted for all positions. Are you sure you want to proceed?')) return;
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
      alert('An error occurred while submitting your votes. Please report to the ICT department.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center min-h-[50vh] flex flex-col justify-center items-center">
    <Loader2 className="animate-spin text-kabarak-green mb-4 h-8 w-8" />
    <p className="text-gray-600 text-sm font-medium">Authenticating Ballot...</p>
  </div>;

  if (!activeElection) return (
    <div className="max-w-md mx-auto text-center py-20 px-6">
      <div className="w-16 h-16 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <XCircle size={32} />
      </div>
      <h2 className="text-xl font-bold text-gray-900">Election System Inactive</h2>
      <p className="text-gray-600 mt-2 text-sm leading-relaxed">The voting platform is currently offline. Refer to the official university communication for the election schedule.</p>
      <button onClick={() => navigate('/dashboard')} className="mt-8 px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md text-sm font-semibold transition-colors">Return to Dashboard</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-32">
      <header className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-widest mb-4 border border-gray-200">
          <ShieldCheck size={14} className="mr-2" />
          Encrypted Voting Session active
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{activeElection.title}</h1>
        <p className="text-gray-500 font-semibold uppercase tracking-wider text-xs">Academic Year {activeElection.year}</p>
        
        <div className="mt-6 flex items-center justify-center space-x-3 text-sm text-gray-600 bg-gray-50 py-3 px-6 rounded-md w-fit mx-auto border border-gray-200">
          <Info size={16} className="text-kabarak-green" />
          <span>Select ONE candidate for each position. Your cast ballot is final.</span>
        </div>
      </header>

      <div className="space-y-12">
        {positions.map((pos, idx) => {
          const posCandidates = candidates.filter(c => c.positionId === pos.id);
          return (
            <section key={pos.id} className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-100">
                 <div className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded font-bold text-sm border border-gray-200">
                   {idx + 1}
                 </div>
                 <div>
                    <h2 className="text-lg font-bold text-gray-900">{pos.title}</h2>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">Select a candidate for this position</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posCandidates.map(c => {
                  const u = users.find(user => user.id === c.userId);
                  const isSelected = votes[pos.id] === c.id;
                  return (
                    <div 
                      key={c.id} 
                      onClick={() => handleVoteSelect(pos.id, c.id)}
                      className={`cursor-pointer transition-colors rounded-lg overflow-hidden border-2 flex flex-col ${
                        isSelected 
                        ? 'border-kabarak-green bg-kabarak-green/5 ring-1 ring-kabarak-green ring-offset-2' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative border-b border-gray-200">
                        <img 
                          src={c.photoURL || `https://picsum.photos/seed/${c.id}/400/300`} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          alt="Candidate"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-900/80 to-transparent p-4">
                          <p className="text-white font-bold text-base mb-0.5">{u?.name}</p>
                          <p className="text-gray-300 font-semibold text-[10px] uppercase tracking-wider">{u?.admissionNumber}</p>
                        </div>
                        
                        {isSelected && (
                          <div className="absolute top-3 right-3 bg-white text-kabarak-green rounded-full shadow-sm">
                            <CheckCircle size={24} />
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-grow flex flex-col">
                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                           {c.bio || "No manifesto provided."}
                        </p>
                        <div className="mt-4 pt-4 flex items-center justify-between border-t border-gray-100">
                           <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-kabarak-green' : 'text-gray-500'}`}>
                             {isSelected ? 'Selected' : 'Click to Select'}
                           </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {posCandidates.length === 0 && (
                  <div className="col-span-full py-8 text-center text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    No candidates registered for this position.
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4">
          <div>
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Status</p>
             <p className="text-sm font-bold text-gray-900">{Object.keys(votes).length} of {positions.length} Positions Selected</p>
          </div>
          <button 
            onClick={handleSubmitVotes}
            disabled={submitting || Object.keys(votes).length === 0}
            className="flex items-center bg-kabarak-green text-white px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-kabarak-darkGreen transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : (
              <VoteIcon className="mr-2 h-4 w-4" />
            )}
            Cast Ballot
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotingBooth;
