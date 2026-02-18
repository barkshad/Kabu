import React, { useState, useEffect } from 'react';
import { useSiteConfig } from '../contexts/ConfigContext';
import { mockSupabase } from '../services/mockSupabase';
import { Position, Candidate } from '../types';
import { Settings, X, Save, Plus, Trash2, Edit2, Lock, ChevronUp, ChevronDown, User, Layers, Type } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { config, updateConfig, refreshConfig } = useSiteConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'positions' | 'candidates'>('general');
  const [error, setError] = useState('');

  // Data State
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [formData, setFormData] = useState({ ...config });
  
  // Edit/Add States
  const [editingPos, setEditingPos] = useState<string | null>(null);
  const [editingCand, setEditingCand] = useState<Partial<Candidate> | null>(null);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      loadData();
    }
  }, [isAuthenticated, isOpen]);

  const loadData = async () => {
    const [pos, cand] = await Promise.all([
      mockSupabase.getPositions(),
      mockSupabase.getCandidates()
    ]);
    setPositions(pos);
    setCandidates(cand);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '12345') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleGeneralSave = async () => {
    await updateConfig(formData);
    alert('Site configuration updated!');
  };

  // --- Position Logic ---
  const handleAddPosition = async () => {
    const title = prompt('Enter Position Title:');
    if (title) {
      await mockSupabase.addPosition(title);
      loadData();
    }
  };

  const handleDeletePosition = async (id: string) => {
    if (confirm('Delete this position and all its candidates?')) {
      await mockSupabase.deletePosition(id);
      loadData();
    }
  };

  // --- Candidate Logic ---
  const handleSaveCandidate = async () => {
    if (!editingCand || !editingCand.name || !editingCand.position_id) return;
    
    if (editingCand.id) {
      await mockSupabase.updateCandidate(editingCand.id, editingCand);
    } else {
      await mockSupabase.addCandidate(editingCand as Omit<Candidate, 'id'>);
    }
    setEditingCand(null);
    loadData();
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-900 text-white p-3 rounded-full shadow-2xl z-50 hover:bg-gray-800 transition-all hover:scale-110"
        title="Open CMS Admin"
      >
        <Settings size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto" onClick={() => setIsOpen(false)}></div>
      
      <div className={`bg-white w-full sm:max-w-4xl sm:rounded-2xl shadow-2xl pointer-events-auto flex flex-col transition-all duration-300 ${isAuthenticated ? 'h-[85vh]' : 'h-auto sm:h-auto'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 sm:rounded-t-2xl">
          <div className="flex items-center space-x-2">
            <div className="bg-gray-900 text-white p-1.5 rounded-lg">
               <Settings size={18} />
            </div>
            <h2 className="font-bold text-gray-800">Admin CMS Panel</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:bg-gray-200 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Auth Screen */}
        {!isAuthenticated ? (
          <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Restricted Access</h3>
            <p className="text-gray-500 mb-6 text-center text-sm">Enter the administrator passcode to edit the website.</p>
            <form onSubmit={handleLogin} className="w-full max-w-xs">
              <input
                type="password"
                placeholder="Enter Passcode (12345)"
                className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-black focus:border-black outline-none text-center tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
              <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-colors">
                Unlock Panel
              </button>
            </form>
          </div>
        ) : (
          /* Main Content */
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-16 sm:w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
              <nav className="flex-1 p-2 space-y-1">
                {[
                  { id: 'general', icon: Type, label: 'General' },
                  { id: 'positions', icon: Layers, label: 'Positions' },
                  { id: 'candidates', icon: User, label: 'Candidates' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                      activeTab === tab.id ? 'bg-white shadow-sm text-black font-bold' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="hidden sm:block">{tab.label}</span>
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t border-gray-200 text-xs text-gray-400 hidden sm:block">
                v1.0.0
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white">
              
              {/* --- GENERAL SETTINGS --- */}
              {activeTab === 'general' && (
                <div className="space-y-6 max-w-2xl">
                  <h3 className="text-2xl font-bold mb-4">Site Configuration</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">University Name</label>
                      <input 
                        className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-colors"
                        value={formData.universityName} 
                        onChange={(e) => setFormData({...formData, universityName: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Election Title</label>
                      <input 
                        className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-colors"
                        value={formData.electionTitle} 
                        onChange={(e) => setFormData({...formData, electionTitle: e.target.value})} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Academic Year</label>
                        <input 
                          className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-colors"
                          value={formData.academicYear} 
                          onChange={(e) => setFormData({...formData, academicYear: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Primary Color</label>
                        <div className="flex items-center space-x-2">
                           <input 
                             type="color" 
                             className="h-12 w-12 rounded cursor-pointer border-0"
                             value={formData.primaryColor} 
                             onChange={(e) => setFormData({...formData, primaryColor: e.target.value})} 
                           />
                           <input 
                              className="flex-1 p-3 border rounded-lg bg-gray-50 uppercase"
                              value={formData.primaryColor}
                              readOnly
                           />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Announcement Banner</label>
                      <textarea 
                        className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-colors"
                        rows={3}
                        value={formData.announcement} 
                        onChange={(e) => setFormData({...formData, announcement: e.target.value})} 
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleGeneralSave}
                    className="flex items-center bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-transform active:scale-95"
                  >
                    <Save size={18} className="mr-2" />
                    Save Configuration
                  </button>
                </div>
              )}

              {/* --- POSITIONS --- */}
              {activeTab === 'positions' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">Positions</h3>
                    <button onClick={handleAddPosition} className="bg-black text-white p-2 rounded-lg flex items-center text-sm font-bold px-4 hover:bg-gray-800">
                      <Plus size={16} className="mr-2" /> Add Position
                    </button>
                  </div>
                  <div className="space-y-2">
                    {positions.map((pos) => (
                      <div key={pos.id} className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-center space-x-4">
                          <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 text-xs">
                            {pos.order}
                          </span>
                          <span className="font-bold text-lg">{pos.title}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleDeletePosition(pos.id)} 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- CANDIDATES --- */}
              {activeTab === 'candidates' && (
                <div className="space-y-4">
                   <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">Candidates</h3>
                    <button 
                      onClick={() => setEditingCand({ name: '', manifesto_text: '', image_url: 'https://picsum.photos/200', position_id: positions[0]?.id })} 
                      className="bg-black text-white p-2 rounded-lg flex items-center text-sm font-bold px-4 hover:bg-gray-800"
                    >
                      <Plus size={16} className="mr-2" /> Add Candidate
                    </button>
                  </div>

                  {/* Candidate Form Modal Overlay inside the tab */}
                  {editingCand && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
                      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h4 className="text-xl font-bold mb-4">{editingCand.id ? 'Edit' : 'New'} Candidate</h4>
                        <div className="space-y-3">
                          <input 
                            placeholder="Full Name"
                            className="w-full p-3 border rounded-lg"
                            value={editingCand.name || ''} 
                            onChange={e => setEditingCand({...editingCand, name: e.target.value})}
                          />
                          <select 
                            className="w-full p-3 border rounded-lg"
                            value={editingCand.position_id || ''}
                            onChange={e => setEditingCand({...editingCand, position_id: e.target.value})}
                          >
                             {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                          </select>
                          <textarea 
                             placeholder="Manifesto"
                             className="w-full p-3 border rounded-lg"
                             rows={4}
                             value={editingCand.manifesto_text || ''} 
                             onChange={e => setEditingCand({...editingCand, manifesto_text: e.target.value})}
                          />
                          <input 
                            placeholder="Image URL"
                            className="w-full p-3 border rounded-lg text-sm font-mono text-gray-500"
                            value={editingCand.image_url || ''} 
                            onChange={e => setEditingCand({...editingCand, image_url: e.target.value})}
                          />
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                           <button onClick={() => setEditingCand(null)} className="px-4 py-2 text-gray-600 font-bold">Cancel</button>
                           <button onClick={handleSaveCandidate} className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800">Save</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {candidates.map((cand) => (
                      <div key={cand.id} className="border rounded-xl p-4 flex items-start space-x-3 hover:shadow-md transition-shadow">
                         <img src={cand.image_url} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                         <div className="flex-1 min-w-0">
                           <h4 className="font-bold truncate">{cand.name}</h4>
                           <p className="text-xs text-gray-500">{positions.find(p => p.id === cand.position_id)?.title}</p>
                         </div>
                         <div className="flex space-x-1">
                            <button onClick={() => setEditingCand(cand)} className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><Edit2 size={16}/></button>
                            <button onClick={() => mockSupabase.deleteCandidate(cand.id).then(loadData)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={16}/></button>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
