import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockSupabase } from '../services/mockSupabase';
import { Position, Candidate } from '../types';
import { Check, ChevronRight, ChevronLeft, Info, X, Vote, Loader2 } from 'lucide-react';

const VotingBooth: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selections, setSelections] = useState<{ [posId: string]: string }>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [viewManifesto, setViewManifesto] = useState<Candidate | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const user = mockSupabase.getCurrentUser();
      if (!user) { navigate('/login'); return; }
      if (user.has_voted) { navigate('/success'); return; }

      const [posData, candData] = await Promise.all([
        mockSupabase.getPositions(),
        mockSupabase.getCandidates()
      ]);
      setPositions(posData);
      setCandidates(candData);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleSelect = (candidateId: string) => {
    const currentPosId = positions[currentStep].id;
    setSelections(prev => ({ ...prev, [currentPosId]: candidateId }));
  };

  const handleNext = () => {
    if (currentStep < positions.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    const user = mockSupabase.getCurrentUser();
    if (!user) return;

    setSubmitting(true);
    const result = await mockSupabase.castVote(user.id, selections);
    if (result.success) {
      navigate('/success', { state: { receipt: result.receipt } });
    } else {
      alert(result.error);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-kabarak-green animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Preparing 2026 Ballot...</p>
      </div>
    );
  }

  // REVIEW PAGE (Last Step)
  if (currentStep === positions.length) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Review Your Selections</h2>
          <p className="text-gray-600 mt-2">Please confirm your choices before submitting. This action is final.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="divide-y divide-gray-100">
            {positions.map((pos) => {
              const selectedCandId = selections[pos.id];
              const candidate = candidates.find(c => c.id === selectedCandId);
              return (
                <div key={pos.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{pos.title}</p>
                    <p className="text-lg font-bold text-gray-900">{candidate?.name}</p>
                  </div>
                  <div className="flex items-center">
                    <img src={candidate?.image_url} alt="" className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover mr-4" />
                    <button 
                      onClick={() => setCurrentStep(positions.findIndex(p => p.id === pos.id))}
                      className="text-sm text-kabarak-green font-medium hover:underline"
                    >
                      Change
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8 flex items-start">
          <input 
            type="checkbox" 
            id="acknowledge" 
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 h-5 w-5 text-kabarak-green rounded border-gray-300 focus:ring-kabarak-green cursor-pointer"
          />
          <label htmlFor="acknowledge" className="ml-3 text-sm text-gray-700 leading-relaxed cursor-pointer select-none">
            I certify that I am the authorized account holder. I understand that my vote is final and cannot be changed once cast.
          </label>
        </div>

        <div className="flex justify-between items-center">
          <button 
            onClick={handlePrev}
            disabled={submitting}
            className="px-6 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors"
          >
            Back to Ballot
          </button>
          <button
            onClick={handleSubmit}
            disabled={!acknowledged || submitting}
            className={`flex items-center px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
              !acknowledged || submitting 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-kabarak-green hover:bg-[#005500] hover:shadow-xl transform hover:-translate-y-1'
            }`}
          >
            {submitting ? (
               <>
                 <Loader2 className="animate-spin mr-2 h-5 w-5" />
                 Securing Vote...
               </>
            ) : (
               <>
                 <Vote className="mr-2 h-5 w-5" />
                 Cast My Vote
               </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // VOTING STEPS
  const currentPosition = positions[currentStep];
  const positionCandidates = candidates.filter(c => c.position_id === currentPosition.id);
  const currentSelection = selections[currentPosition.id];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between text-sm font-bold text-gray-500 mb-3">
          <span>Position {currentStep + 1} of {positions.length}</span>
          <span>{Math.round(((currentStep) / positions.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-kabarak-green h-3 rounded-full transition-all duration-700 ease-in-out shadow-sm" 
            style={{ width: `${((currentStep + 1) / positions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-10 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-green-50 text-kabarak-green text-xs font-bold uppercase tracking-wide mb-2">Vote For</span>
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">{currentPosition.title}</h2>
        <p className="text-gray-500 mt-2 font-medium">Select one candidate for this position.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {positionCandidates.map(candidate => {
          const isSelected = currentSelection === candidate.id;
          return (
            <div 
              key={candidate.id}
              className={`relative bg-white rounded-3xl border-2 transition-all duration-300 overflow-hidden group cursor-pointer ${
                isSelected 
                  ? 'border-kabarak-gold shadow-xl ring-4 ring-kabarak-gold/20 scale-[1.01]' 
                  : 'border-gray-100 hover:border-gray-300 hover:shadow-lg'
              }`}
              onClick={() => handleSelect(candidate.id)}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 bg-kabarak-gold text-kabarak-green px-6 py-1.5 text-xs font-bold rounded-bl-2xl z-10 shadow-sm flex items-center">
                  <Check className="w-3 h-3 mr-1" /> SELECTED
                </div>
              )}
              
              <div className="p-6 md:p-8 flex items-start space-x-6">
                 <div className="flex-shrink-0">
                    <img 
                        src={candidate.image_url} 
                        alt={candidate.name} 
                        className={`w-24 h-24 rounded-full object-cover border-4 transition-colors ${isSelected ? 'border-kabarak-gold' : 'border-gray-100'}`}
                    />
                 </div>
                 <div className="flex-grow">
                    <h3 className="font-bold text-xl text-gray-900 mb-1">{candidate.name}</h3>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setViewManifesto(candidate); }}
                      className="text-xs text-kabarak-green font-bold hover:underline flex items-center bg-green-50 px-3 py-1.5 rounded-full w-fit mb-4"
                    >
                      <Info className="w-3 h-3 mr-1.5" />
                      Read Manifesto
                    </button>
                    
                    <button
                        className={`w-full py-3 rounded-xl font-bold transition-all flex justify-center items-center text-sm ${
                            isSelected
                            ? 'bg-kabarak-green text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {isSelected ? 'Confirmed Selection' : 'Click to Select'}
                    </button>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center px-4">
        <button 
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`px-6 py-3 rounded-xl font-bold transition-colors flex items-center ${
             currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Previous
        </button>
        
        <button 
          onClick={handleNext}
          disabled={!currentSelection}
          className={`px-10 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center text-lg ${
            !currentSelection
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-kabarak-green text-white hover:bg-[#005500] hover:shadow-xl transform hover:-translate-y-1'
          }`}
        >
          Next Position
          <ChevronRight className="w-6 h-6 ml-1" />
        </button>
      </div>

      {/* Manifesto Modal */}
      {viewManifesto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative">
             <button 
                onClick={() => setViewManifesto(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>

            <div className="flex flex-col items-center text-center mb-6">
               <img src={viewManifesto.image_url} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg mb-4" />
               <h3 className="font-bold text-2xl text-gray-900">{viewManifesto.name}</h3>
               <p className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full mt-2">Official Manifesto</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed italic relative text-lg font-serif">
              <span className="text-6xl text-kabarak-gold absolute -top-4 -left-2 opacity-30 font-sans">"</span>
              {viewManifesto.manifesto_text}
              <span className="text-6xl text-kabarak-gold absolute -bottom-8 -right-2 opacity-30 font-sans">"</span>
            </div>

            <div className="mt-8">
              <button 
                onClick={() => setViewManifesto(null)}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
              >
                Close Manifesto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingBooth;