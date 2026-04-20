import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export enum AuditAction {
  LOGIN = 'LOGIN',
  VOTE = 'VOTE',
  CREATE_CANDIDATE = 'CREATE_CANDIDATE',
  UPDATE_CANDIDATE = 'UPDATE_CANDIDATE',
  DELETE_CANDIDATE = 'DELETE_CANDIDATE',
  TOGGLE_ELECTION = 'TOGGLE_ELECTION',
  DISQUALIFY_CANDIDATE = 'DISQUALIFY_CANDIDATE',
  SWITCH_ELECTION = 'SWITCH_ELECTION',
}

export const logAdminAction = async (
  adminId: string,
  action: AuditAction,
  targetType: string,
  targetId: string,
  metadata: any = {}
) => {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      adminId,
      action,
      targetType,
      targetId,
      metadata,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
};
