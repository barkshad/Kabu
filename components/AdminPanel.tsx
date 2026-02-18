import React, { useState, useEffect } from 'react';
import { useSiteConfig } from '../contexts/ConfigContext';
import { mockSupabase } from '../services/mockSupabase';
import { Position, Candidate } from '../types';
import { Settings, X, Save, Plus, Trash2, Edit2, Lock, ChevronUp, ChevronDown, User, Layers, Type, LogIn } from 'lucide-react';

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

  // Sync formData with config updates
  useEffect(() => {
    setFormData({ ...config });
  }, [config]);

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
    if (password.trim() === '12345') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleGeneralSave = async () => {
    await updateConfig(formData);
    alert('Site configuration updated successfully!');
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
    if (!editingCand || !editingCand.name || !editingCand.position_id) {
       alert('Please fill in Name and Position');
       return;
    }
    
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
        className="fixed bottom-6 right-6 bg-gray-900 text-white p-4 rounded-full shadow-2xl z-50 hover:bg-black transition-all hover:scale-105 flex items-center gap-2 group border-2 border-white/20"
        title="Open CMS Admin"
      >
        <Settings size={24} className="group-hover:rotate-90 transition-transform" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-bold text-sm">Edit Site</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={() => setIsOpen(false)}></div>
      
      <div className={`bg-white w-full sm:max-w-5xl sm:rounded-2xl shadow-2xl pointer-events-auto flex flex-col transition-all duration-300 relative z-10 ${isAuthenticated ? 'h-[85vh]' : 'h-auto sm:h-auto'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 sm:rounded-t-2xl">
          <div className="flex items-center space-x-2">
            <div className="bg-gray-900 text-white p-1.5 rounded-lg">
               <Settings size={18} />
            </div>
            <h2 className="font-bold text-gray-800">Admin CMS Panel</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:bg-gray-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Auth Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
               <Lock className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">Restricted Access</h3>
            <p className="text-gray-500 mb-8 text-center text-sm max-w-xs">Authorized personnel only. Please enter your administrator passcode.</p>
            <form onSubmit={handleLogin} className="w-full max-w-xs">
              <input
                type="password"
                placeholder="Passcode (12345)"
                className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-black focus:border-black outline-none text-center tracking-[0.5em] font-mono text-lg transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center font-medium animate-pulse">{error}</div>}
              <button className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center">
                <LogIn size={18} className="mr-2" />
                Unlock Panel
              </button>
            </form>
          </div>
        ) : (
          /* Main Content */
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-16 sm:w-56 bg-gray-50 border-r border-gray-200 flex flex-col">
              <nav className="flex-1 p-2 space-y-1">
                {[
                  { id: 'general', icon: Type, label: 'General Settings' },
                  { id: 'positions', icon: Layers, label: 'Manage Positions' },
                  { id: 'candidates', icon: User, label: 'Manage Candidates' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
                      activeTab === tab.id ? 'bg-white shadow-sm text-black font-bold ring-1 ring-black/5' : 'text-gray-500 hover:bg-gray-200/50'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="hidden sm:block text-sm">{tab.label}</span>
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t border-gray-200 text-xs text-gray-400 hidden sm:block text-center">
                CMS v2.4 • Secure
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white">
              
              {/* --- GENERAL SETTINGS --- */}
              {activeTab === 'general' && (
                <div className="space-y-8 max-w-3xl mx-auto">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Site Configuration</h3>
                    <p className="text-gray-500 text-sm">Customize the branding and key information of the portal.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">University Name</label>
                      <input 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                        value={formData.universityName} 
                        onChange={(e) => setFormData({...formData, universityName: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Election Title</label>
                      <input 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                        value={formData.electionTitle} 
                        onChange={(e) => setFormData({...formData, electionTitle: e.target.value})} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Academic Year</label>
                        <input 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                          value={formData.academicYear} 
                          onChange={(e) => setFormData({...formData, academicYear: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Brand Colors</label>
                        <div className="flex space-x-3">
                           <div className="flex-1">
                             <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-black">
                               <input 
                                 type="color" 
                                 className="h-10 w-10 border-0 p-0 cursor-pointer"
                                 value={formData.primaryColor} 
                                 onChange={(e) => setFormData({...formData, primaryColor: e.target.value})} 
                                 title="Primary Color"
                               />
                               <span className="flex-1 px-2 text-xs font-mono">{formData.primaryColor}</span>
                             </div>
                           </div>
                           <div className="flex-1">
                             <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-black">
                               <input 
                                 type="color" 
                                 className="h-10 w-10 border-0 p-0 cursor-pointer"
                                 value={formData.secondaryColor} 
                                 onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})} 
                                 title="Secondary Color"
                               />
                               <span className="flex-1 px-2 text-xs font-mono">{formData.secondaryColor}</span>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Dashboard Welcome Message</label>
                      <textarea 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                        rows={2}
                        value={formData.welcomeMessage} 
                        onChange={(e) => setFormData({...formData, welcomeMessage: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Announcement Banner</label>
                      <textarea 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                        rows={3}
                        value={formData.announcement} 
                        onChange={(e) => setFormData({...formData, announcement: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button 
                      onClick={handleGeneralSave}
                      className="flex items-center bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-all hover:shadow-lg active:scale-95"
                    >
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* --- POSITIONS --- */}
              {activeTab === 'positions' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-bold">Positions</h3>
                        <p className="text-gray-500 text-sm">Define the electable roles for the ballot.</p>
                    </div>
                    <button onClick={handleAddPosition} className="bg-black text-white p-2.5 rounded-lg flex items-center text-sm font-bold px-4 hover:bg-gray-800 transition-colors shadow-lg">
                      <Plus size={16} className="mr-2" /> Add Position
                    </button>
                  </div>
                  <div className="space-y-3">
                    {positions.map((pos) => (
                      <div key={pos.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all bg-white group">
                        <div className="flex items-center space-x-4">
                          <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 text-xs">
                            {pos.order}
                          </span>
                          <span className="font-bold text-lg text-gray-800">{pos.title}</span>
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                                const newTitle = prompt("Edit Position Title", pos.title);
                                if(newTitle) { mockSupabase.updatePosition(pos.id, {title: newTitle}); loadData(); }
                            }}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeletePosition(pos.id)} 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {positions.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-400">No positions defined yet.</p>
                        </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- CANDIDATES --- */}
              {activeTab === 'candidates' && (
                <div className="space-y-6 max-w-5xl mx-auto">
                   <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-bold">Candidates</h3>
                        <p className="text-gray-500 text-sm">Manage the candidates running for office.</p>
                    </div>
                    <button 
                      onClick={() => setEditingCand({ name: '', manifesto_text: '', image_url: 'https://picsum.photos/200', position_id: positions[0]?.id || '' })} 
                      className="bg-black text-white p-2.5 rounded-lg flex items-center text-sm font-bold px-4 hover:bg-gray-800 transition-colors shadow-lg"
                    >
                      <Plus size={16} className="mr-2" /> Add Candidate
                    </button>
                  </div>

                  {/* Candidate Form Modal Overlay inside the tab */}
                  {editingCand && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                      <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-bold text-gray-900">{editingCand.id ? 'Edit' : 'New'} Candidate</h4>
                            <button onClick={() => setEditingCand(null)}><X className="text-gray-400 hover:text-gray-600"/></button>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Name</label>
                            <input 
                              placeholder="e.g. Jane Doe"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                              value={editingCand.name || ''} 
                              onChange={e => setEditingCand({...editingCand, name: e.target.value})}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Position</label>
                            <select 
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white"
                              value={editingCand.position_id || ''}
                              onChange={e => setEditingCand({...editingCand, position_id: e.target.value})}
                            >
                               <option value="" disabled>Select a position</option>
                               {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Manifesto</label>
                            <textarea 
                               placeholder="Candidate's platform..."
                               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                               rows={4}
                               value={editingCand.manifesto_text || ''} 
                               onChange={e => setEditingCand({...editingCand, manifesto_text: e.target.value})}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Image URL</label>
                            <div className="flex space-x-2">
                                <input 
                                placeholder="https://..."
                                className="flex-1 p-3 border border-gray-300 rounded-lg text-sm font-mono text-gray-600 focus:ring-2 focus:ring-black outline-none"
                                value={editingCand.image_url || ''} 
                                onChange={e => setEditingCand({...editingCand, image_url: e.target.value})}
                                />
                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                    {editingCand.image_url && <img src={editingCand.image_url} className="w-full h-full object-cover" alt="Preview" />}
                                </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-100">
                           <button onClick={() => setEditingCand(null)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                           <button onClick={handleSaveCandidate} className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-md">
                                {editingCand.id ? 'Save Changes' : 'Create Candidate'}
                           </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {candidates.map((cand) => (
                      <div key={cand.id} className="border border-gray-200 rounded-xl p-4 flex items-center space-x-4 hover:shadow-md transition-shadow bg-white group">
                         <img src={cand.image_url} className="w-14 h-14 rounded-full object-cover bg-gray-100 border border-gray-100" alt={cand.name} />
                         <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-gray-900 truncate">{cand.name}</h4>
                           <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full mt-1">
                               {positions.find(p => p.id === cand.position_id)?.title || 'Unknown Position'}
                           </span>
                         </div>
                         <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingCand(cand)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Edit"><Edit2 size={16}/></button>
                            <button onClick={() => mockSupabase.deleteCandidate(cand.id).then(loadData)} className="p-2 hover:bg-red-50 rounded-lg text-red-500" title="Delete"><Trash2 size={16}/></button>
                         </div>
                      </div>
                    ))}
                    {candidates.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-400">No candidates added yet.</p>
                        </div>
                    )}
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
