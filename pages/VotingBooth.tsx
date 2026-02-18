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
        <p className="text-gray-500 font-medium">Preparing your ballot paper...</p>
      </div>
    );
  }

  // REVIEW PAGE (Last Step)
  if (currentStep === positions.length) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Review Your Selections</h2>
          <p className="text-gray-600 mt-2">Please confirm your choices before submitting. This action is final.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
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

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 flex items-start">
          <input 
            type="checkbox" 
            id="acknowledge" 
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 h-5 w-5 text-kabarak-green rounded border-gray-300 focus:ring-kabarak-green"
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
                : 'bg-kabarak-green hover:bg-green-800 hover:shadow-xl transform hover:-translate-y-1'
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
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
          <span>Position {currentStep + 1} of {positions.length}</span>
          <span>{Math.round(((currentStep) / positions.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-kabarak-green h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${((currentStep + 1) / positions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">{currentPosition.title}</h2>
        <p className="text-gray-500 mt-2">Select one candidate for this position.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {positionCandidates.map(candidate => {
          const isSelected = currentSelection === candidate.id;
          return (
            <div 
              key={candidate.id}
              className={`relative bg-white rounded-xl border-2 transition-all duration-200 overflow-hidden group ${
                isSelected 
                  ? 'border-kabarak-gold shadow-md ring-1 ring-kabarak-gold' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 bg-kabarak-gold text-kabarak-green px-3 py-1 text-xs font-bold rounded-bl-xl z-10">
                  SELECTED
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={candidate.image_url} 
                    alt={candidate.name} 
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                  />
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">{candidate.name}</h3>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setViewManifesto(candidate); }}
                      className="text-xs text-kabarak-green font-semibold hover:underline flex items-center mt-1"
                    >
                      <Info className="w-3 h-3 mr-1" />
                      View Manifesto
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleSelect(candidate.id)}
                  className={`w-full py-3 rounded-lg font-bold transition-colors flex justify-center items-center ${
                    isSelected
                      ? 'bg-kabarak-green text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Selected
                    </>
                  ) : 'Select Candidate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <button 
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
             currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Previous
        </button>
        
        <button 
          onClick={handleNext}
          disabled={!currentSelection}
          className={`px-8 py-3 rounded-lg font-bold shadow-md transition-all flex items-center ${
            !currentSelection
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-kabarak-green text-white hover:bg-green-800'
          }`}
        >
          Next Position
          <ChevronRight className="w-5 h-5 ml-1" />
        </button>
      </div>

      {/* Manifesto Modal */}
      {viewManifesto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <img src={viewManifesto.image_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{viewManifesto.name}</h3>
                  <p className="text-sm text-gray-500">Candidate Manifesto</p>
                </div>
              </div>
              <button 
                onClick={() => setViewManifesto(null)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 leading-relaxed italic relative">
              <span className="text-4xl text-kabarak-gold absolute -top-2 -left-2 opacity-50">"</span>
              {viewManifesto.manifesto_text}
              <span className="text-4xl text-kabarak-gold absolute -bottom-4 -right-2 opacity-50">"</span>
            </div>

            <div className="mt-6 text-right">
              <button 
                onClick={() => setViewManifesto(null)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingBooth;
