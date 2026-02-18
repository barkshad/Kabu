import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockSupabase } from '../services/mockSupabase';
import { Position, Candidate } from '../types';

const Dashboard: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selections, setSelections] = useState<{ [posId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = mockSupabase.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      if (user.has_voted) {
        navigate('/success');
        return;
      }

      const [posData, candData] = await Promise.all([
        mockSupabase.getPositions(),
        mockSupabase.getCandidates()
      ]);
      setPositions(posData);
      setCandidates(candData);
      setLoading(false);
    };
    fetchData();
  }, [navigate]);

  const handleSelect = (positionId: string, candidateId: string) => {
    setSelections(prev => ({ ...prev, [positionId]: candidateId }));
  };

  const isFormComplete = positions.length > 0 && positions.every(p => selections[p.id]);

  const handleSubmitVote = async () => {
    const user = mockSupabase.getCurrentUser();
    if (!user) return;

    setSubmitting(true);
    const result = await mockSupabase.castVote(user.id, selections);
    
    if (result.success) {
      // Pass the receipt hash via state to the success page
      navigate('/success', { state: { receipt: result.receipt } });
    } else {
      alert(result.error || "Failed to cast vote");
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <i className="fas fa-spinner fa-spin text-4xl text-kabarak-green mb-4"></i>
        <p className="text-gray-500">Loading Ballot...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 border-l-8 border-kabarak-gold pl-4">Digital Ballot</h2>
        <p className="mt-2 text-gray-600 pl-6">Please select one candidate for each position. Your vote is anonymous and final.</p>
      </div>

      <div className="space-y-12">
        {positions.map(position => {
          const positionCandidates = candidates.filter(c => c.position_id === position.id);
          
          return (
            <div key={position.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-kabarak-green">{position.title}</h3>
                {selections[position.id] && (
                   <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                     <i className="fas fa-check mr-1"></i> Selected
                   </span>
                )}
              </div>
              
              <div className="p-6 grid gap-6 md:grid-cols-2">
                {positionCandidates.map(candidate => {
                  const isSelected = selections[position.id] === candidate.id;
                  return (
                    <div 
                      key={candidate.id}
                      onClick={() => handleSelect(position.id, candidate.id)}
                      className={`relative flex flex-col rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? 'border-kabarak-gold bg-yellow-50/30' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-kabarak-gold">
                          <i className="fas fa-check-circle text-2xl bg-white rounded-full"></i>
                        </div>
                      )}
                      
                      <div className="flex items-center p-4">
                        <img 
                          src={candidate.image_url} 
                          alt={candidate.name} 
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                        />
                        <div className="ml-4">
                          <h4 className="font-bold text-gray-900">{candidate.name}</h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{candidate.manifesto_text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Button for Mobile / Sticky Footer for Desktop */}
      <div className="sticky bottom-4 mt-8 flex justify-end">
        <button
          onClick={() => isFormComplete && setConfirmOpen(true)}
          disabled={!isFormComplete}
          className={`shadow-xl px-8 py-4 rounded-full font-bold text-lg flex items-center transition-all transform hover:scale-105 ${
            isFormComplete 
              ? 'bg-kabarak-green text-white hover:bg-kabarak-darkGreen cursor-pointer' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>Review & Cast Vote</span>
          <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl transform transition-all">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Your Vote</h3>
            <p className="text-gray-600 mb-6">
              You are about to cast your vote for the selected candidates. This action cannot be undone.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 max-h-60 overflow-y-auto">
              {positions.map(p => {
                const selectedCandidate = candidates.find(c => c.id === selections[p.id]);
                return (
                  <div key={p.id} className="flex justify-between text-sm border-b border-gray-200 pb-2 last:border-0">
                    <span className="text-gray-500">{p.title}:</span>
                    <span className="font-semibold text-gray-900">{selectedCandidate?.name}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitVote}
                disabled={submitting}
                className="flex-1 py-3 px-4 bg-kabarak-green text-white rounded-lg font-bold hover:bg-kabarak-darkGreen shadow-md transition-colors flex justify-center items-center"
              >
                {submitting ? <i className="fas fa-spinner fa-spin"></i> : 'Confirm Vote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;