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
  Lock, 
  Unlock,
  AlertTriangle,
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

  if (loading) return <div className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2" /> Loading System Logs...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-red-900 text-white p-6 rounded-lg shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ShieldAlert size={32} className="text-red-200" />
          <div>
            <h1 className="text-xl font-bold">Super Admin Vault</h1>
            <p className="text-red-200 text-sm">Highest privilege system controls active</p>
          </div>
        </div>
        <button 
          onClick={createNewElection}
          className="bg-white text-red-900 px-4 py-2 rounded-md font-semibold text-sm hover:bg-gray-100 transition-colors shadow-sm"
        >
          Initialize New Election
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Logs */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center bg-gray-50">
            <History className="mr-2 text-gray-500" size={18} />
            <h2 className="font-semibold text-gray-800 text-sm">System Audit Logs</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {logs.map(log => {
              const admin = users.find(u => u.id === log.adminId);
              const date = log.createdAt?.toDate ? log.createdAt.toDate() : new Date();
              return (
                <div key={log.id} className="p-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-kabarak-green uppercase tracking-wider">{log.action}</span>
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-semibold">{admin?.name || 'System'}</span> modified {log.targetType} <span className="font-mono text-xs text-gray-400">({log.targetId})</span>
                      </p>
                      {log.metadata && (
                        <pre className="text-[10px] bg-gray-100 text-gray-700 p-2 mt-2 rounded border border-gray-200 overflow-x-auto font-mono">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{format(date, 'MMM d, HH:mm:ss')}</span>
                  </div>
                </div>
              );
            })}
            {logs.length === 0 && (
               <div className="p-8 text-center text-sm text-gray-500">No logs generated yet.</div>
            )}
          </div>
        </div>

        {/* Stability & Disqualification */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center bg-gray-50">
              <AlertTriangle className="mr-2 text-gray-500" size={18} />
              <h2 className="font-semibold text-gray-800 text-sm">Integrity Controls</h2>
            </div>
            <div className="p-4 space-y-3">
              {candidates.filter(c => !c.isDisqualified).map(c => {
                const u = users.find(user => user.id === c.userId);
                return (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{u?.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {c.id.substring(0,8)}</p>
                    </div>
                    <button 
                      onClick={() => disqualifyCandidate(c.id, false)}
                      className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
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
                  <div key={c.id} className="flex items-center justify-between p-3 bg-red-50 rounded-md border border-red-100">
                    <div>
                      <p className="text-sm font-semibold text-red-900">{u?.name}</p>
                      <p className="text-xs text-red-600 font-mono mt-0.5">Disqualified</p>
                    </div>
                    <button 
                      onClick={() => disqualifyCandidate(c.id, true)}
                      className="p-1.5 text-red-400 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                      title="Reinstate Candidate"
                    >
                      <Unlock size={16} />
                    </button>
                  </div>
                );
              })}
              {candidates.length === 0 && (
                 <div className="text-sm text-gray-500 text-center py-4">No candidates active.</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-800 text-sm">Quick Stats</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold text-gray-900">{users.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                <span className="text-gray-600">Total Candidates</span>
                <span className="font-semibold text-gray-900">{candidates.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Audit Events</span>
                <span className="font-semibold text-gray-900">{logs.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAdvanced;
