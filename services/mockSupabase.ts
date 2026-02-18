import { Profile, Position, Candidate, Vote, VoteResult } from '../types';

// Initial Mock Data
const MOCK_POSITIONS: Position[] = [
  { id: 'pos_1', title: 'President', order: 1 },
  { id: 'pos_2', title: 'Secretary General', order: 2 },
  { id: 'pos_3', title: 'Finance Representative', order: 3 },
];

const MOCK_CANDIDATES: Candidate[] = [
  { id: 'cand_1', name: 'John Kamau', position_id: 'pos_1', manifesto_text: 'Unity and Progress for all students.', image_url: 'https://picsum.photos/200/200?random=1' },
  { id: 'cand_2', name: 'Sarah Chebet', position_id: 'pos_1', manifesto_text: 'Transparency in leadership.', image_url: 'https://picsum.photos/200/200?random=2' },
  { id: 'cand_3', name: 'David Ochieng', position_id: 'pos_2', manifesto_text: 'Efficient communication channels.', image_url: 'https://picsum.photos/200/200?random=3' },
  { id: 'cand_4', name: 'Mercy Wanjiku', position_id: 'pos_2', manifesto_text: 'Student welfare first.', image_url: 'https://picsum.photos/200/200?random=4' },
  { id: 'cand_5', name: 'Brian Koech', position_id: 'pos_3', manifesto_text: 'Accountability in student funds.', image_url: 'https://picsum.photos/200/200?random=5' },
  { id: 'cand_6', name: 'Faith Akinyi', position_id: 'pos_3', manifesto_text: 'Budgeting for better clubs.', image_url: 'https://picsum.photos/200/200?random=6' },
];

// Local Storage Keys
const LS_KEY_PROFILES = 'kvp_profiles';
const LS_KEY_VOTES = 'kvp_votes';
const LS_KEY_CURRENT_USER = 'kvp_current_user';

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockSupabaseService {
  private profiles: Profile[] = [];
  private votes: Vote[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const storedProfiles = localStorage.getItem(LS_KEY_PROFILES);
    const storedVotes = localStorage.getItem(LS_KEY_VOTES);

    if (storedProfiles) {
      this.profiles = JSON.parse(storedProfiles);
    } else {
      // Seed admin and some users if empty
      this.profiles = [
        { id: 'admin_1', email: 'admin@kabarak.ac.ke', full_name: 'System Admin', has_voted: false, role: 'admin' },
        { id: 'student_1', email: 'student@kabarak.ac.ke', full_name: 'Test Student', has_voted: false, role: 'student' }
      ];
      this.saveToStorage();
    }

    if (storedVotes) {
      this.votes = JSON.parse(storedVotes);
    }
  }

  private saveToStorage() {
    localStorage.setItem(LS_KEY_PROFILES, JSON.stringify(this.profiles));
    localStorage.setItem(LS_KEY_VOTES, JSON.stringify(this.votes));
  }

  async signIn(email: string): Promise<{ user: Profile | null, error: string | null }> {
    await delay(800); // Simulate network

    if (!email.endsWith('@kabarak.ac.ke')) {
      return { user: null, error: 'Access restricted to @kabarak.ac.ke emails only.' };
    }

    let user = this.profiles.find(p => p.email === email);

    if (!user) {
      // Auto-register for demo purposes
      user = {
        id: crypto.randomUUID(),
        email,
        full_name: email.split('@')[0].replace('.', ' '), // Simple name generation
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
    localStorage.removeItem(LS_KEY_CURRENT_USER);
  }

  getCurrentUser(): Profile | null {
    const stored = localStorage.getItem(LS_KEY_CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  }

  async getPositions(): Promise<Position[]> {
    await delay(300);
    return MOCK_POSITIONS;
  }

  async getCandidates(): Promise<Candidate[]> {
    await delay(300);
    return MOCK_CANDIDATES;
  }

  async castVote(userId: string, votes: { [positionId: string]: string }): Promise<{ success: boolean, receipt: string, error?: string }> {
    await delay(1000);

    const userIndex = this.profiles.findIndex(p => p.id === userId);
    if (userIndex === -1) return { success: false, receipt: '', error: 'User not found' };
    
    if (this.profiles[userIndex].has_voted) {
      return { success: false, receipt: '', error: 'You have already voted.' };
    }

    // "Transaction" start
    try {
      // 1. Record Votes
      const newVotes: Vote[] = Object.entries(votes).map(([posId, candId]) => ({
        id: crypto.randomUUID(),
        position_id: posId,
        candidate_id: candId,
        timestamp: new Date().toISOString()
      }));

      this.votes.push(...newVotes);

      // 2. Update Profile
      this.profiles[userIndex].has_voted = true;
      
      // Update current user session as well
      const sessionUser = this.getCurrentUser();
      if (sessionUser && sessionUser.id === userId) {
        sessionUser.has_voted = true;
        localStorage.setItem(LS_KEY_CURRENT_USER, JSON.stringify(sessionUser));
      }

      this.saveToStorage();

      // Generate Receipt Hash
      const receipt = btoa(`${userId}-${new Date().getTime()}`).substring(0, 16).toUpperCase();
      return { success: true, receipt };

    } catch (e) {
      return { success: false, receipt: '', error: 'System error during vote casting.' };
    }
  }

  async getResults(): Promise<VoteResult[]> {
    await delay(500);
    
    // Aggregate votes
    const results: VoteResult[] = [];
    
    MOCK_POSITIONS.forEach(pos => {
      const candidates = MOCK_CANDIDATES.filter(c => c.position_id === pos.id);
      candidates.forEach(cand => {
        const count = this.votes.filter(v => v.candidate_id === cand.id).length;
        results.push({
          candidateName: cand.name,
          positionTitle: pos.title,
          votes: count
        });
      });
    });

    return results;
  }
}

export const mockSupabase = new MockSupabaseService();