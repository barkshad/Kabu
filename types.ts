export type UserRole = 'student' | 'candidate' | 'admin_basic' | 'admin_super';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  admissionNumber: string;
  role: UserRole;
}

export interface Election {
  id: string;
  title: string;
  year: string;
  isActive: boolean;
  createdAt: any;
}

export interface Position {
  id: string;
  electionId: string;
  title: string;
  description: string;
}

export interface Candidate {
  id: string;
  userId: string;
  electionId: string;
  positionId: string;
  photoURL: string;
  bio: string;
  isDisqualified: boolean;
  voteCount?: number;
}

export interface Vote {
  id: string; // userId_positionId_electionId
  userId: string;
  electionId: string;
  positionId: string;
  candidateId: string;
  createdAt: any;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: any;
  createdAt: any;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}
