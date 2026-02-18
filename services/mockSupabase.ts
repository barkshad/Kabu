import { Profile, Position, Candidate, Vote, VoteResult } from '../types';

// Initial Mock Data
const MOCK_POSITIONS: Position[] = [
  { id: 'pos_1', title: 'Chairperson', order: 1 },
  { id: 'pos_2', title: 'Secretary General', order: 2 },
  { id: 'pos_3', title: 'Finance Representative', order: 3 },
  { id: 'pos_4', title: 'Academic Secretary', order: 4 },
  { id: 'pos_5', title: 'Sports & Entertainment', order: 5 },
];

const MOCK_CANDIDATES: Candidate[] = [
  { id: 'cand_1', name: 'John Kamau', position_id: 'pos_1', manifesto_text: 'Unity and Progress for all students. I promise to improve Wi-Fi connectivity across campus and extend library hours.', image_url: 'https://picsum.photos/200/200?random=1' },
  { id: 'cand_2', name: 'Sarah Chebet', position_id: 'pos_1', manifesto_text: 'Transparency in leadership. My goal is to ensure every student shilling is accounted for and used for student welfare.', image_url: 'https://picsum.photos/200/200?random=2' },
  { id: 'cand_3', name: 'David Ochieng', position_id: 'pos_2', manifesto_text: 'Efficient communication channels. I will digitize the student suggestion box and ensure weekly newsletters.', image_url: 'https://picsum.photos/200/200?random=3' },
  { id: 'cand_4', name: 'Mercy Wanjiku', position_id: 'pos_2', manifesto_text: 'Student welfare first. I will fight for better hostel maintenance and affordable cafeteria prices.', image_url: 'https://picsum.photos/200/200?random=4' },
  { id: 'cand_5', name: 'Brian Koech', position_id: 'pos_3', manifesto_text: 'Accountability in student funds. I propose a quarterly audit report accessible to all students.', image_url: 'https://picsum.photos/200/200?random=5' },
  { id: 'cand_6', name: 'Faith Akinyi', position_id: 'pos_3', manifesto_text: 'Budgeting for better clubs. More funding for sports teams and drama clubs.', image_url: 'https://picsum.photos/200/200?random=6' },
  { id: 'cand_7', name: 'Peter Njoroge', position_id: 'pos_4', manifesto_text: 'Advocating for better grading policies and supplementary exam fairness.', image_url: 'https://picsum.photos/200/200?random=7' },
  { id: 'cand_8', name: 'Alice Mutua', position_id: 'pos_4', manifesto_text: 'More academic workshops and industry linkages for final year students.', image_url: 'https://picsum.photos/200/200?random=8' },
  { id: 'cand_9', name: 'Samuel Otieno', position_id: 'pos_5', manifesto_text: 'Revamping the annual cultural week and introducing e-sports tournaments.', image_url: 'https://picsum.photos/200/200?random=9' },
  { id: 'cand_10', name: 'Grace Wamalwa', position_id: 'pos_5', manifesto_text: 'Ensuring sports equipment is available and well-maintained for all students.', image_url: 'https://picsum.photos/200/200?random=10' },
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
        { id: 'admin_1', email: 'admin@kabarak.ac.ke', full_name: 'System Admin', registration_number: 'ADMIN-001', has_voted: false, role: 'admin' },
        { id: 'student_1', email: 'student@kabarak.ac.ke', full_name: 'Test Student', registration_number: 'CS/M/1234/2024', has_voted: false, role: 'student' }
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
      return { user: null, error: 'Access denied. Please use your official @kabarak.ac.ke email address.' };
    }

    let user = this.profiles.find(p => p.email === email);

    if (!user) {
      // Auto-register for demo purposes
      const nameParts = email.split('@')[0].split('.');
      const formattedName = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
      
      user = {
        id: crypto.randomUUID(),
        email,
        full_name: formattedName,
        registration_number: `REG/${Math.floor(1000 + Math.random() * 9000)}/2024`,
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
    await delay(300);
    localStorage.removeItem(LS_KEY_CURRENT_USER);
  }

  getCurrentUser(): Profile | null {
    const stored = localStorage.getItem(LS_KEY_CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  }

  async getPositions(): Promise<Position[]> {
    await delay(300);
    return MOCK_POSITIONS.sort((a, b) => a.order - b.order);
  }

  async getCandidates(): Promise<Candidate[]> {
    await delay(300);
    return MOCK_CANDIDATES;
  }

  async castVote(userId: string, votes: { [positionId: string]: string }): Promise<{ success: boolean, receipt: string, error?: string }> {
    await delay(1500); // Simulate secure transaction time

    const userIndex = this.profiles.findIndex(p => p.id === userId);
    if (userIndex === -1) return { success: false, receipt: '', error: 'User not found' };
    
    if (this.profiles[userIndex].has_voted) {
      return { success: false, receipt: '', error: 'Our records show you have already voted.' };
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

      // Generate Receipt Hash (simulating a blockchain or secure hash)
      const receipt = `KAB-${userId.substring(0,4).toUpperCase()}-${new Date().getTime().toString(36).toUpperCase()}`;
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
