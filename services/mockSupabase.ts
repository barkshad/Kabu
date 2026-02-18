import { Profile, Position, Candidate, Vote, VoteResult, SiteConfig } from '../types';

// Initial Mock Data
let MOCK_POSITIONS: Position[] = [
  { id: 'pos_1', title: 'Chairperson', order: 1 },
  { id: 'pos_2', title: 'Secretary General', order: 2 },
  { id: 'pos_3', title: 'Finance Representative', order: 3 },
  { id: 'pos_4', title: 'Academic Secretary', order: 4 },
  { id: 'pos_5', title: 'Sports & Entertainment', order: 5 },
];

let MOCK_CANDIDATES: Candidate[] = [
  { id: 'cand_1', name: 'John Kamau', position_id: 'pos_1', manifesto_text: 'Unity and Progress for all students.', image_url: 'https://picsum.photos/200/200?random=1' },
  { id: 'cand_2', name: 'Sarah Chebet', position_id: 'pos_1', manifesto_text: 'Transparency in leadership.', image_url: 'https://picsum.photos/200/200?random=2' },
  { id: 'cand_3', name: 'David Ochieng', position_id: 'pos_2', manifesto_text: 'Efficient communication channels.', image_url: 'https://picsum.photos/200/200?random=3' },
  { id: 'cand_4', name: 'Mercy Wanjiku', position_id: 'pos_2', manifesto_text: 'Student welfare first.', image_url: 'https://picsum.photos/200/200?random=4' },
];

const DEFAULT_CONFIG: SiteConfig = {
  universityName: 'Kabarak University',
  electionTitle: 'Student Council Elections',
  academicYear: '2026',
  primaryColor: '#006400',
  secondaryColor: '#FFD700',
  contactEmail: 'elections@kabarak.ac.ke',
  welcomeMessage: 'Your participation is crucial for the future of Kabarak.',
  announcement: 'Voting is now open. Please cast your vote responsibly.',
};

// Local Storage Keys
const LS_KEY_PROFILES = 'kvp_profiles';
const LS_KEY_VOTES = 'kvp_votes';
const LS_KEY_CURRENT_USER = 'kvp_current_user';
const LS_KEY_CONFIG = 'kvp_site_config';
const LS_KEY_POSITIONS = 'kvp_positions';
const LS_KEY_CANDIDATES = 'kvp_candidates';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockSupabaseService {
  private profiles: Profile[] = [];
  private votes: Vote[] = [];
  private siteConfig: SiteConfig = DEFAULT_CONFIG;
  private positions: Position[] = [];
  private candidates: Candidate[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const storedProfiles = localStorage.getItem(LS_KEY_PROFILES);
    const storedVotes = localStorage.getItem(LS_KEY_VOTES);
    const storedConfig = localStorage.getItem(LS_KEY_CONFIG);
    const storedPositions = localStorage.getItem(LS_KEY_POSITIONS);
    const storedCandidates = localStorage.getItem(LS_KEY_CANDIDATES);

    if (storedProfiles) {
      this.profiles = JSON.parse(storedProfiles);
    } else {
      this.profiles = [
        { id: 'admin_1', email: 'admin@kabarak.ac.ke', full_name: 'System Admin', registration_number: 'ADMIN-001', has_voted: false, role: 'admin' },
      ];
      this.saveToStorage();
    }

    this.votes = storedVotes ? JSON.parse(storedVotes) : [];
    this.siteConfig = storedConfig ? JSON.parse(storedConfig) : DEFAULT_CONFIG;
    this.positions = storedPositions ? JSON.parse(storedPositions) : MOCK_POSITIONS;
    this.candidates = storedCandidates ? JSON.parse(storedCandidates) : MOCK_CANDIDATES;
  }

  private saveToStorage() {
    localStorage.setItem(LS_KEY_PROFILES, JSON.stringify(this.profiles));
    localStorage.setItem(LS_KEY_VOTES, JSON.stringify(this.votes));
    localStorage.setItem(LS_KEY_CONFIG, JSON.stringify(this.siteConfig));
    localStorage.setItem(LS_KEY_POSITIONS, JSON.stringify(this.positions));
    localStorage.setItem(LS_KEY_CANDIDATES, JSON.stringify(this.candidates));
  }

  // --- Auth & User ---
  async signIn(email: string): Promise<{ user: Profile | null, error: string | null }> {
    await delay(500);
    if (!email.endsWith('@kabarak.ac.ke')) return { user: null, error: 'Access denied. Use @kabarak.ac.ke email.' };
    
    let user = this.profiles.find(p => p.email === email);
    if (!user) {
      const nameParts = email.split('@')[0].split('.');
      const formattedName = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
      user = {
        id: crypto.randomUUID(),
        email,
        full_name: formattedName,
        registration_number: `REG/${Math.floor(1000 + Math.random() * 9000)}/${this.siteConfig.academicYear}`,
        has_voted: false,
        role: 'student'
      };
      this.profiles.push(user);
      this.saveToStorage();
    }
    localStorage.setItem(LS_KEY_CURRENT_USER, JSON.stringify(user));
    return { user, error: null };
  }

  async signOut() {
    await delay(200);
    localStorage.removeItem(LS_KEY_CURRENT_USER);
  }

  getCurrentUser(): Profile | null {
    const stored = localStorage.getItem(LS_KEY_CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  }

  // --- Config CMS ---
  async getSiteConfig(): Promise<SiteConfig> {
    await delay(100);
    return { ...this.siteConfig };
  }

  async updateSiteConfig(newConfig: SiteConfig): Promise<void> {
    await delay(300);
    this.siteConfig = newConfig;
    this.saveToStorage();
  }

  // --- Positions CMS ---
  async getPositions(): Promise<Position[]> {
    await delay(200);
    return this.positions.sort((a, b) => a.order - b.order);
  }

  async addPosition(title: string): Promise<Position> {
    const newPos: Position = {
      id: crypto.randomUUID(),
      title,
      order: this.positions.length + 1
    };
    this.positions.push(newPos);
    this.saveToStorage();
    return newPos;
  }

  async updatePosition(id: string, updates: Partial<Position>): Promise<void> {
    this.positions = this.positions.map(p => p.id === id ? { ...p, ...updates } : p);
    this.saveToStorage();
  }

  async deletePosition(id: string): Promise<void> {
    this.positions = this.positions.filter(p => p.id !== id);
    // Cascade delete candidates
    this.candidates = this.candidates.filter(c => c.position_id !== id);
    this.saveToStorage();
  }

  // --- Candidates CMS ---
  async getCandidates(): Promise<Candidate[]> {
    await delay(200);
    return this.candidates;
  }

  async addCandidate(candidate: Omit<Candidate, 'id'>): Promise<Candidate> {
    const newCand: Candidate = { ...candidate, id: crypto.randomUUID() };
    this.candidates.push(newCand);
    this.saveToStorage();
    return newCand;
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<void> {
    this.candidates = this.candidates.map(c => c.id === id ? { ...c, ...updates } : c);
    this.saveToStorage();
  }

  async deleteCandidate(id: string): Promise<void> {
    this.candidates = this.candidates.filter(c => c.id !== id);
    this.saveToStorage();
  }

  // --- Voting ---
  async castVote(userId: string, votes: { [positionId: string]: string }): Promise<{ success: boolean, receipt: string, error?: string }> {
    await delay(1000);
    const userIndex = this.profiles.findIndex(p => p.id === userId);
    if (userIndex === -1) return { success: false, receipt: '', error: 'User not found' };
    if (this.profiles[userIndex].has_voted) return { success: false, receipt: '', error: 'Already voted.' };

    const newVotes: Vote[] = Object.entries(votes).map(([posId, candId]) => ({
      id: crypto.randomUUID(),
      position_id: posId,
      candidate_id: candId,
      timestamp: new Date().toISOString()
    }));
    this.votes.push(...newVotes);
    this.profiles[userIndex].has_voted = true;
    
    // Update session
    const sessionUser = this.getCurrentUser();
    if (sessionUser && sessionUser.id === userId) {
      sessionUser.has_voted = true;
      localStorage.setItem(LS_KEY_CURRENT_USER, JSON.stringify(sessionUser));
    }
    this.saveToStorage();
    const receipt = `KAB-${userId.substring(0,4).toUpperCase()}-${new Date().getTime().toString(36).toUpperCase()}`;
    return { success: true, receipt };
  }

  async getResults(): Promise<VoteResult[]> {
    await delay(300);
    const results: VoteResult[] = [];
    this.positions.forEach(pos => {
      const posCandidates = this.candidates.filter(c => c.position_id === pos.id);
      posCandidates.forEach(cand => {
        const count = this.votes.filter(v => v.candidate_id === cand.id).length;
        results.push({ candidateName: cand.name, positionTitle: pos.title, votes: count });
      });
    });
    return results;
  }
}

export const mockSupabase = new MockSupabaseService();
