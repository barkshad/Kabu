export interface Profile {
  id: string;
  email: string;
  full_name: string;
  registration_number?: string;
  has_voted: boolean;
  role: 'student' | 'admin';
}

export interface Position {
  id: string;
  title: string;
  order: number;
}

export interface Candidate {
  id: string;
  name: string;
  position_id: string;
  manifesto_text: string;
  image_url: string;
}

export interface Vote {
  id: string;
  position_id: string;
  candidate_id: string;
  timestamp: string;
}

export interface VoteResult {
  candidateName: string;
  positionTitle: string;
  votes: number;
}

export interface SiteConfig {
  universityName: string;
  electionTitle: string;
  academicYear: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  welcomeMessage: string;
  announcement: string;
}
