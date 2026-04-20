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
  Loader2,
  UserPlus,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import AdminSidebarLayout from '../components/AdminSidebarLayout';

const AdminAdvanced: React.FC = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allowedAdmins, setAllowedAdmins] = useState<string[]>(JSON.parse(localStorage.getItem('allowedAdmins') || '["barakashadrack0@gmail.com"]'));

  useEffect(() => {
    const adminRole = localStorage.getItem('adminRole');
    if ((!profile || profile.role !== 'admin_super') && adminRole !== 'admin_super') {
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

  const addAdmin = () => {
    const email = window.prompt('Enter new admin email:');
    if (email && !allowedAdmins.includes(email)) {
      const newList = [...allowedAdmins, email];
      setAllowedAdmins(newList);
      localStorage.setItem('allowedAdmins', JSON.stringify(newList));
    }
  };

  if (loading) return <AdminSidebarLayout isAdminAdvanced={true}><div className="p-8 text-center text-neutral-500"><Loader2 className="animate-spin inline mr-2" /> Loading System Logs...</div></AdminSidebarLayout>;

  return (
    <AdminSidebarLayout isAdminAdvanced={true}>
      <div className="space-y-6">
        <header className="flex items-center justify-between p-6 bg-neutral-900 border border-neutral-800 rounded-lg shadow-inner">
          <div className="flex items-center gap-4">
             <ShieldAlert className="text-red-500" size={32} />
             <div>
               <h1 className="text-xl font-bold text-white tracking-tight">Super Admin Vault</h1>
               <p className="text-neutral-400 text-sm">Privileged system authority active.</p>
             </div>
          </div>
          <div className="flex gap-3">
             <button onClick={addAdmin} className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm rounded-lg transition-colors">
               <UserPlus size={16} /> Add Admin
             </button>
             <button onClick={createNewElection} className="flex items-center gap-2 px-4 py-2 bg-red-950 hover:bg-red-900 text-red-100 font-semibold text-sm rounded-lg transition-colors border border-red-900">
               Initialize Election
             </button>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
             <div className="p-4 border-b border-neutral-800 flex items-center gap-2 bg-neutral-950/50">
               <History size={18} className="text-neutral-500" />
               <h2 className="font-semibold text-neutral-200 text-sm">System Audit Logs</h2>
             </div>
             <div className="max-h-[500px] overflow-y-auto">
                {logs.map(log => (
                  <div key={log.id} className="p-4 border-b border-neutral-800 hover:bg-neutral-800/30">
                    <div className="flex justify-between items-start text-sm">
                      <div className="text-neutral-300">
                         <span className="text-xs font-bold text-red-400 uppercase">{log.action}</span>
                         <p className="mt-1"><span className="font-semibold">{users.find(u => u.id === log.adminId)?.name || 'System'}</span> action: {log.targetType}</p>
                      </div>
                      <span className="text-xs text-neutral-500 whitespace-nowrap ml-4">
                        {format(log.createdAt?.toDate ? log.createdAt.toDate() : new Date(), 'MMM d, HH:mm')}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
                <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 flex items-center gap-2">
                 <AlertTriangle size={18} className="text-neutral-500" />
                 <h2 className="font-semibold text-neutral-200 text-sm">Integrity Controls</h2>
                </div>
                <div className="p-4 space-y-2">
                  {candidates.map(c => {
                    const u = users.find(user => user.id === c.userId);
                    return (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-md border border-neutral-700">
                        <span className="text-sm font-medium text-neutral-200">{u?.name}</span>
                        <button onClick={() => disqualifyCandidate(c.id, c.isDisqualified)} 
                          className={`p-1.5 rounded transition-colors ${c.isDisqualified ? 'text-green-500 hover:bg-neutral-700' : 'text-neutral-500 hover:text-red-500'}`}>
                          {c.isDisqualified ? <Unlock size={16}/> : <Lock size={16}/>}
                        </button>
                      </div>
                    )
                  })}
                </div>
            </div>
          </div>
        </section>
      </div>
    </AdminSidebarLayout>
  );
};

export default AdminAdvanced;
