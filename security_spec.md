# Security Specification: Kabarak University Voting Platform

## 1. Data Invariants

1. **User Role Integrity:** A user's role MUST be verified and immutable by the user themselves. Only an admin (`admin_super`) can modify other users' roles or data.
2. **Election Lifecycle Lock:** An election's `isActive` state restricts voting. Votes CANNOT be cast if `isActive` is false.
3. **One Vote Per Position Per User:** A user can only cast exactly one vote per position in an active election. The document ID for a vote MUST strictly be `{userId}_{positionId}_{electionId}`.
4. **Candidate Existence & Qualification:** A vote can only be cast for a candidate that actually exists, belongs to the correct election/position, and is NOT disqualified (`isDisqualified == false`).
5. **Vote Immutability:** Once a vote is cast, it CANNOT be updated or deleted.
6. **Audit Trail Immutability:** Audit logs can only be created by admins, and they CANNOT be updated or deleted by anyone.
7. **Disqualification Lock:** If a candidate is disqualified, their status can only be reinstated by an admin (`admin_super`).

## 2. The "Dirty Dozen" Payloads

1. **Elevation of Privilege Attack:** A regular student attempts to update their own `/users/{userId}` record to set `"role": "admin_super"`.
2. **Impersonation Vote:** User A attempts to create a vote document at `/votes/UserB_Pos1_Elec1` specifying User B's `userId`.
3. **Double Voting (Update Gap):** A user attempts to update an existing vote document to point to a new candidate.
4. **Inactive Election Vote:** A user attempts to cast a vote when the corresponding election document has `isActive: false`.
5. **Disqualified Candidate Vote:** A user attempts to cast a vote for a candidate whose `isDisqualified` is `true`.
6. **Candidate Forgery:** A user attempts to cast a vote for a non-existent candidate or position.
7. **Audit Log Erasure:** An admin attempts to delete a document from `/audit_logs/`.
8. **Shadow Field Injection:** A user attempts to create a vote with an extra payload field: `{"userId": "123", "candidateId": "456", "isAdmin": true}`.
9. **Denial of Wallet (Huge String):** A user submits a 10MB string for their profile `name` or `bio`.
10. **Time-Traveling Vote:** A user submits a vote with a forged `createdAt` timestamp from 2020 instead of `request.time`.
11. **Client-Side Admin Bypass:** A user attempts to create an election document without having the `admin_super` role in the associated `/users/` document.
12. **Vote Count Tampering:** A regular user attempts to manually update `voteCount` on a `/candidates/` document instead of the server doing it via trusted functions.

## 3. The Test Runner 

(Handled via theoretical Red Team Audit)
