import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  limit,
  doc,
  updateDoc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { AuditLog, Election, Candidate } from '../types';
import { logAdminAction, AuditAction } from '../services/audit';
import { 
  ShieldAlert, 
  History, 
  BarChart3, 
  Activity, 
  Lock, 
  Unlock,
  AlertTriangle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

const AdminAdvanced: React.FC = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || profile.role !== 'admin_super') {
      navigate('/dashboard');
      return;
    }

    const unsubLogs = onSnapshot(
      query(collection(db, 'audit_logs'), orderBy('createdAt', 'desc'), limit(50)),
      (snap) => {
        setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog)));
      }
    );

    const unsubElections = onSnapshot(collection(db, 'elections'), (snap) => {
      setElections(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Election)));
    });

    const unsubCandidates = onSnapshot(collection(db, 'candidates'), (snap) => {
      setCandidates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Candidate)));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setLoading(false);
    return () => {
      unsubLogs();
      unsubElections();
      unsubCandidates();
      unsubUsers();
    };
  }, [profile, navigate]);

  const disqualifyCandidate = async (candidateId: string, currentStatus: boolean) => {
    if (!user) return;
    const newStatus = !currentStatus;
    if (!window.confirm(`Are you sure you want to ${newStatus ? 'disqualify' : 'reinstate'} this candidate?`)) return;
    
    await updateDoc(doc(db, 'candidates', candidateId), { isDisqualified: newStatus });
    await logAdminAction(user.uid, AuditAction.DISQUALIFY_CANDIDATE, 'candidate', candidateId, { disqualified: newStatus });
  };

  const createNewElection = async () => {
    if (!user) return;
    const title = window.prompt('Election Title:');
    const year = window.prompt('Academic Year (e.g. 2023/2024):');
    if (!title || !year) return;

    // Deactivate others first
    const activeOnes = elections.filter(e => e.isActive);
    for (const e of activeOnes) {
      await updateDoc(doc(db, 'elections', e.id), { isActive: false });
    }

    await addDoc(collection(db, 'elections'), {
      title,
      year,
      isActive: true,
      createdAt: serverTimestamp()
    });
    await logAdminAction(user.uid, AuditAction.SWITCH_ELECTION, 'election', 'new', { title, year });
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading System Logs...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-red-900 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ShieldAlert size={40} className="text-kabarak-gold" />
          <div>
            <h1 className="text-2xl font-bold">Super Admin Vault</h1>
            <p className="text-red-200 text-sm">Highest privilege system controls active</p>
          </div>
        </div>
        <button 
          onClick={createNewElection}
          className="bg-white text-red-900 px-6 py-2 rounded-xl font-bold hover:bg-kabarak-gold transition-colors"
        >
          Initialize New Election
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Logs */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center">
            <History className="mr-2 text-gray-400" />
            <h2 className="font-bold text-gray-800">System Audit Logs</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {logs.map(log => {
              const admin = users.find(u => u.id === log.adminId);
              const date = log.createdAt?.toDate ? log.createdAt.toDate() : new Date();
              return (
                <div key={log.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-kabarak-green uppercase">{log.action}</span>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-bold">{admin?.name || 'System'}</span> modified {log.targetType} <span className="font-mono text-xs">({log.targetId})</span>
                      </p>
                      {log.metadata && (
                        <pre className="text-[10px] bg-gray-100 p-2 mt-2 rounded-md overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{format(date, 'MMM d, HH:mm:ss')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stability & Disqualification */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-6 flex items-center">
              <AlertTriangle className="mr-2 text-kabarak-gold" />
              Integrity Controls
            </h2>
            <div className="space-y-4">
              {candidates.filter(c => !c.isDisqualified).map(c => {
                const u = users.find(user => user.id === c.userId);
                return (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs font-bold text-gray-800">{u?.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Candidate ID: {c.id.substring(0,8)}</p>
                    </div>
                    <button 
                      onClick={() => disqualifyCandidate(c.id, false)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Disqualify Candidate"
                    >
                      <Lock size={16} />
                    </button>
                  </div>
                );
              })}
              {candidates.filter(c => c.isDisqualified).map(c => {
                const u = users.find(user => user.id === c.userId);
                return (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                    <div>
                      <p className="text-xs font-bold text-red-900">{u?.name}</p>
                      <p className="text-[10px] text-red-400 uppercase">Disqualified</p>
                    </div>
                    <button 
                      onClick={() => disqualifyCandidate(c.id, true)}
                      className="p-2 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Reinstate Candidate"
                    >
                      <Unlock size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total Users</span>
                <span className="font-bold">{users.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total Candidates</span>
                <span className="font-bold">{candidates.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Audit Events</span>
                <span className="font-bold">{logs.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAdvanced;
