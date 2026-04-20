import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Candidate, Position, Election } from '../types';
import { uploadToCloudinary } from '../services/cloudinary';
import { logAdminAction, AuditAction } from '../services/audit';
import { 
  Plus, 
  Trash2, 
  Play, 
  Square, 
  Users, 
  Upload, 
  X,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AdminSidebarLayout from '../components/AdminSidebarLayout';

const Admin: React.FC = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [activeElection, setActiveElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [users, setUsers] = useState<any[]>([]); // To map candidate names
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ userId: '', positionId: '', bio: '', photoURL: '' });

  // Add listener for logo
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'appGlobal'), (snap) => {
      if (snap.exists()) {
        setLogoUrl(snap.data().logoUrl);
      }
    });
    return unsub;
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setUploadingLogo(true);
    try {
      const url = await uploadToCloudinary(file);
      await updateDoc(doc(db, 'settings', 'appGlobal'), { logoUrl: url });
      setLogoUrl(url);
      await logAdminAction(user.uid, AuditAction.UPDATE_LOGO, 'settings', 'appGlobal');
      alert('Logo updated successfully');
    } catch (error) {
      console.error(error);
      alert('Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    const adminRole = localStorage.getItem('adminRole');
    if ((!profile || (profile.role !== 'admin_basic' && profile.role !== 'admin_super')) && 
        (adminRole !== 'admin_basic' && adminRole !== 'admin_super')) {
      navigate('/dashboard');
      return;
    }

    // Listen for active election
    const electionQuery = query(collection(db, 'elections'), where('isActive', '==', true));
    const unsubElection = onSnapshot(electionQuery, (snap) => {
      if (!snap.empty) {
        setActiveElection({ id: snap.docs[0].id, ...snap.docs[0].data() } as Election);
      } else {
        setActiveElection(null);
      }
    });

    // Listen for all users (to find potential candidates by name/admission)
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setLoading(false);
    return () => {
      unsubElection();
      unsubUsers();
    };
  }, [profile, navigate]);

  useEffect(() => {
    if (!activeElection) return;

    const unsubCandidates = onSnapshot(
      query(collection(db, 'candidates'), where('electionId', '==', activeElection.id)),
      (snap) => {
        setCandidates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Candidate)));
      }
    );

    const unsubPositions = onSnapshot(
      query(collection(db, 'positions'), where('electionId', '==', activeElection.id)),
      (snap) => {
        setPositions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Position)));
      }
    );

    return () => {
      unsubCandidates();
      unsubPositions();
    };
  }, [activeElection]);

  const toggleElectionStatus = async () => {
    if (!activeElection || !user) return;
    const newStatus = !activeElection.isActive;
    await updateDoc(doc(db, 'elections', activeElection.id), { isActive: newStatus });
    await logAdminAction(user.uid, AuditAction.TOGGLE_ELECTION, 'election', activeElection.id, { newStatus });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setNewCandidate(prev => ({ ...prev, photoURL: url }));
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeElection || !user) return;
    
    try {
      await addDoc(collection(db, 'candidates'), {
        ...newCandidate,
        electionId: activeElection.id,
        isDisqualified: false,
        voteCount: 0
      });
      await updateDoc(doc(db, 'users', newCandidate.userId), { role: 'candidate' });
      await logAdminAction(user.uid, AuditAction.CREATE_CANDIDATE, 'candidate', newCandidate.userId);
      setShowAddModal(false);
      setNewCandidate({ userId: '', positionId: '', bio: '', photoURL: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCandidate = async (id: string, userId: string) => {
    if (!window.confirm('Are you sure?') || !user) return;
    await deleteDoc(doc(db, 'candidates', id));
    await updateDoc(doc(db, 'users', userId), { role: 'student' });
    await logAdminAction(user.uid, AuditAction.DELETE_CANDIDATE, 'candidate', userId);
  };

  if (loading) return <AdminSidebarLayout><div className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2" /> Loading...</div></AdminSidebarLayout>;

  return (
    <AdminSidebarLayout>
      <div className="space-y-8">
        {/* Branding Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Application Branding</h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 shadow-inner">
              {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain" /> : <Upload className="text-gray-400" size={24} />}
            </div>
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 py-2 px-4 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload size={16} />}
                Upload New Logo
              </span>
              <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
            </label>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeElection ? `Current Election: ${activeElection.title} (${activeElection.year})` : 'No Active Election'}
            </p>
          </div>
          <div className="flex gap-3">
            {activeElection && (
              <button 
                onClick={toggleElectionStatus}
                className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold border transition-all shadow-sm ${
                  activeElection.isActive 
                  ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
                  : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                }`}
              >
                {activeElection.isActive ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {activeElection.isActive ? 'Close Election' : 'Open Election'}
              </button>
            )}
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-5 py-2.5 bg-green-800 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-green-900 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Candidate
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {positions.map(pos => {
            const posCandidates = candidates
              .filter(c => c.positionId === pos.id)
              .map(c => {
                const u = users.find(user => user.id === c.userId);
                return {
                  name: u?.name || 'Unknown',
                  votes: c.voteCount || 0
                };
              });
            
            return (
              <div key={pos.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4">{pos.title} - Live Results</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={posCandidates} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={100} fontSize={12} tick={{ fill: '#4B5563' }} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="votes" barSize={20} radius={[0, 4, 4, 0]}>
                        {posCandidates.map((_, i) => (
                          <Cell key={i} fill={'#065f46'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>

        {/* Candidates Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="font-semibold text-gray-800 text-sm">Candidates Directory</h2>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{candidates.length} Registered</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-600">Candidate</th>
                  <th className="px-6 py-3 font-semibold text-gray-600">Position</th>
                  <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3 font-semibold text-gray-600">Votes</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.map(c => {
                  const u = users.find(user => user.id === c.userId);
                  const p = positions.find(pos => pos.id === c.positionId);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center space-x-3">
                          <img src={c.photoURL || 'https://picsum.photos/40/40'} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                          <div>
                            <p className="font-semibold text-gray-900">{u?.name}</p>
                            <p className="text-xs text-gray-500">{u?.admissionNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-medium text-gray-700">{p?.title}</span>
                      </td>
                      <td className="px-6 py-3">
                        {c.isDisqualified ? (
                          <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-semibold uppercase rounded">Disqualified</span>
                        ) : (
                          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold uppercase rounded">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-semibold text-gray-900">{c.voteCount || 0}</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button 
                          onClick={() => handleDeleteCandidate(c.id, c.userId)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Candidate Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Add New Candidate</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleAddCandidate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Select Student</label>
                  <select 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-green-800 text-sm"
                    value={newCandidate.userId}
                    onChange={e => setNewCandidate(prev => ({ ...prev, userId: e.target.value }))}
                  >
                    <option value="">Choose a student...</option>
                    {users.filter(u => u.role === 'student').map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.admissionNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Position</label>
                  <select 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-green-800 text-sm"
                    value={newCandidate.positionId}
                    onChange={e => setNewCandidate(prev => ({ ...prev, positionId: e.target.value }))}
                  >
                    <option value="">Select position...</option>
                    {positions.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bio/Manifesto</label>
                  <textarea 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-green-800 h-24 resize-none text-sm"
                    placeholder="Short bio..."
                    value={newCandidate.bio}
                    onChange={e => setNewCandidate(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Photo</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                      {newCandidate.photoURL ? <img src={newCandidate.photoURL} className="w-full h-full object-cover" /> : <Users className="text-gray-400" size={20} />}
                    </div>
                    <label className="flex-1 cursor-pointer">
                      <span className="block w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 text-center hover:bg-gray-50 transition-colors">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Choose File'}
                      </span>
                      <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                    </label>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button 
                    type="submit"
                    disabled={uploading}
                    className="w-full py-2 px-4 bg-green-800 text-white rounded-md text-sm font-semibold hover:bg-green-900 transition-colors disabled:opacity-70"
                  >
                    Register Candidate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
};

export default Admin;
