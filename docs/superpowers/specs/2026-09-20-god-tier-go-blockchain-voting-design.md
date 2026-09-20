# God-Tier Go Blockchain Voting System: Technical Specification

**Date:** 2026-09-20  
**Status:** Proposed / Under Review  
**Language/Runtime:** Go (Golang 1.27)  
**Target Repository:** `bitwizard25/block_vote`  

---

## 1. Executive Summary

This specification outlines the architecture, cryptographic protocol, state management, and user experience for transitioning **BlockVote** into a **God-Tier, production-grade, privacy-preserving blockchain voting platform** written entirely in **Go**.

The system addresses the fundamental paradox of electronic elections:
1. **Universal Verifiability & Tamper-Proofing:** Every citizen and external auditor can mathematically prove that every vote was counted accurately and no block has been altered.
2. **Absolute Secret-Ballot Anonymity:** Zero correlation between a citizen's personal identity (Aadhaar / Voter ID) and the candidate they selected.
3. **Strict Fraud Resistance & Sybil Defense:** Impossible to register multiple times, impossible to cast multiple votes, and resilient against database tampering and 51% forks through automated peer healing.

---

## 2. System Architecture

The application is architected as a high-performance, modular Go binary with embedded assets (`embed.FS`), capable of running autonomously with zero external runtime dependencies.

```
                                  [ Web Client / Browser ]
                                (Modern Dark Web3 Interface)
                                             │
                       HTTP REST & Server-Sent / WebSocket APIs
                                             │
┌────────────────────────────────────────────▼────────────────────────────────────────────┐
│                                   BLOCKVOTE GO ENGINE                                   │
│                                                                                         │
│  ┌─────────────────────────────────┐           ┌─────────────────────────────────────┐  │
│  │     Identity & KYC Subsystem    │           │      Election Governance Engine     │  │
│  │  - Aadhaar Verhoeff Checksum    │           │  - Multi-Election Lifecycle         │  │
│  │  - Voter ID (EPIC) Validation   │           │  - Candidate Manifestos & Profiles  │  │
│  │  - Simulated Aadhaar OTP Modal  │           │  - Ballots (Single/Ranked Choice)   │  │
│  │  - One-Way Salted Sybil Shield  │           │  - Dynamic Tallying Engine          │  │
│  └────────────────┬────────────────┘           └──────────────────┬──────────────────┘  │
│                   │ Identity Commitment                           │ Election Scope      │
│                   ▼                                               ▼                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                     Zero-Knowledge Privacy & Secret Ballot Core                   │  │
│  │  - Client-Side Voter Passport (BIP-39 Mnemonic + 256-bit Secret)                  │  │
│  │  - Anonymous Nullifier Generation: H(VoterSecret || ElectionID)                   │  │
│  │  - Anonymous Ballot Formulation: (CandidateChoice, NullifierHash, Proof)          │  │
│  │  - Spent Nullifier Registry (Strict Double-Voting Prevention)                     │  │
│  └────────────────────────────────────────┬──────────────────────────────────────────┘  │
│                                           │ Unconfirmed Ballot                          │
│                                           ▼                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                     Blockchain Core & Consensus Engine                            │  │
│  │  - Concurrent Thread-Safe Mempool                                                 │  │
│  │  - SHA3-256 Merkle Tree & Inclusion Proof Generator                              │  │
│  │  - PoW Mining Goroutines with Dynamic Difficulty (Leading Zeros)                  │  │
│  │  - Blockchain Ledger Storage (Pure-Go SQLite / Embedded DB)                       │  │
│  │  - P2P Multi-Node Consensus Simulation & Self-Healing Network Mesh                │  │
│  └────────────────────────────────────────┬──────────────────────────────────────────┘  │
│                                           │ Real-Time Broadcast                         │
│                                           ▼                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                         Auditor & Visual Control Room                             │  │
│  │  - Interactive SVG/Canvas Merkle Tree Path Visualizer                             │  │
│  │  - Live Block Explorer & Cryptographic Header Inspector                           │  │
│  │  - Malicious Attack Simulator (DB Tamper, Replay Attack, Fork Consensus)          │  │
│  │  - Real-time Node Telemetry & Event Stream (WebSocket)                            │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Cryptographic & Privacy Protocol

### 3.1. Aadhaar & Voter ID KYC Layer
1. **Aadhaar Format & Checksum Verification:**
   - Aadhaar is validated using the mathematical **Verhoeff algorithm**, catching 100% of single-digit errors and transposed numbers.
   - Masked representation (`XXXX-XXXX-1234`) displayed in UI.
2. **Voter ID (EPIC) Verification:**
   - Validated against the standard Election Commission format (3 uppercase alphabetical characters followed by 7 numeric digits, e.g., `ABC1234567`).
3. **Sybil & Duplicate Identity Shield:**
   - To ensure no citizen registers more than once, the system computes:
     $$\text{IdentityHash} = \text{SHA3-256}(\text{Aadhaar} \parallel \text{EPIC} \parallel \text{SystemSalt})$$
   - Only $\text{IdentityHash}$ is stored in the voter registry table. Raw Aadhaar and EPIC numbers are discarded from memory immediately after verification.
   - If an $\text{IdentityHash}$ collision is detected during registration, the request is rejected with `DUPLICATE_IDENTITY_DETECTED`.

### 3.2. Zero-Knowledge Identity Decoupling (Commitment + Nullifier Scheme)
To guarantee the ballot is 100% anonymous and detached from Aadhaar/EPIC:

1. **Voter Registration & Passport Generation:**
   - Client generates a 256-bit cryptographically secure random number ($\text{VoterSecret}$) and converts it to a 12-word BIP-39 mnemonic seed phrase ("Voter Passport").
   - Client derives the public commitment:
     $$\text{IdentityCommitment} = \text{SHA3-256}(\text{VoterSecret} \parallel \text{VoterSalt})$$
   - The server appends $\text{IdentityCommitment}$ to the **Eligible Voter Roll** for that election.
2. **Anonymous Vote Casting:**
   - When casting a ballot, the voter does **not** send their name, Aadhaar, EPIC, or Identity Commitment.
   - The voter derives a deterministic **Nullifier**:
     $$\text{NullifierHash} = \text{SHA3-256}(\text{VoterSecret} \parallel \text{ElectionID})$$
   - The ballot payload submitted to the mempool contains:
     ```json
     {
       "election_id": "elect_2026_gen",
       "candidate_id": 2,
       "nullifier_hash": "a4f89c...",
       "timestamp": 1774075200,
       "ballot_hash": "c2b18e..."
     }
     ```
3. **Double-Voting Prevention:**
   - The blockchain state maintains a set of `SpentNullifiers[ElectionID]`.
   - Before accepting any ballot into the mempool or sealing a block, the node verifies:
     $$\text{NullifierHash} \notin \text{SpentNullifiers}[\text{ElectionID}]$$
   - If the nullifier already exists, the transaction is dropped instantly. Because $\text{NullifierHash}$ is one-way, no one can discover *who* tried to vote again, yet double voting is strictly impossible.

### 3.3. End-to-End Verifiability (E2E-V) & Merkle Audit Receipts
1. **Leaf Formulation:**
   $$\text{Leaf}_i = \text{SHA3-256}(\text{NullifierHash}_i \parallel \text{CandidateID}_i \parallel \text{Timestamp}_i)$$
2. **Merkle Root:**
   - Calculated for every block by pairing leaves upwards into a full binary Merkle tree.
3. **Voter Receipt:**
   - The voter is provided an immutable `ReceiptHash = Leaf_i`.
   - The voter can paste this hash into the **Auditor Portal** at any time. The system returns the Merkle audit path:
     $$\text{Proof} = [(\text{Sibling}_1, \text{Position}_1), (\text{Sibling}_2, \text{Position}_2), \dots, \text{MerkleRoot}]$$
   - The browser independently computes the hashes up to the Merkle root on the mined block header, visually proving their vote is preserved in the blockchain without revealing their candidate selection to bystanders.

---

## 4. Blockchain Core Specification

### 4.1. Block Data Structure
```go
type Block struct {
    Index        int64     `json:"index"`
    Timestamp    int64     `json:"timestamp"`
    PrevHash     string    `json:"prev_hash"`
    MerkleRoot   string    `json:"merkle_root"`
    Hash         string    `json:"hash"`
    Nonce        int64     `json:"nonce"`
    Difficulty   int       `json:"difficulty"` // e.g., 4 leading zeros
    Transactions []VoteTx  `json:"transactions"`
    MinerAddress string    `json:"miner_address"`
}
```

### 4.2. Proof-of-Work (PoW) Consensus & Dynamic Difficulty
- **Hashing Function:** $\text{SHA3-256}(\text{Index} \parallel \text{PrevHash} \parallel \text{MerkleRoot} \parallel \text{Timestamp} \parallel \text{Difficulty} \parallel \text{Nonce})$
- **Target Condition:** Block hash must start with `N` leading zeros (e.g., `"0000"`).
- **Miner Daemon:** Background worker in Go using goroutines and `select` channels to mine unconfirmed transactions from the mempool when:
  - The mempool reaches `BatchSize` transactions (configurable, default: 10), OR
  - An explicit manual or timer-based sealing command is dispatched.

### 4.3. Multi-Node Peer Network Simulation & Self-Healing
To simulate real-world decentralized security on a single machine without external network overhead:
- The system runs 3 simulated in-memory peer nodes:
  - **Node Alpha (Primary Validator)**
  - **Node Beta (Honest Peer)**
  - **Node Gamma (Auditor Node)**
- When a block is mined, it is broadcast to all peers for verification.
- **Tamper Detection & Healing:** If an attacker modifies a vote in the database of Node Alpha, its computed Merkle Root diverges from Node Beta and Gamma. The consensus mechanism flags Node Alpha as Byzantine, rejects its corrupted ledger, and automatically restores Node Alpha's state from the majority honest chain.

---

## 5. Directory & Package Structure (Go)

```
c:\Users\bhoya\block_vote\
├── cmd\
│   └── blockvote\
│       └── main.go                  // CLI entrypoint, flag parsing, server runner
├── pkg\
│   ├── api\
│   │   ├── handlers.go              // HTTP & WebSocket route handlers
│   │   ├── router.go                // Chi / standard library HTTP multiplexer
│   │   └── websocket.go             // Real-time telemetry hub & broadcaster
│   ├── blockchain\
│   │   ├── block.go                 // Block data structures & serialization
│   │   ├── chain.go                 // Blockchain ledger, validation, forks
│   │   ├── mempool.go               // Thread-safe transaction pool
│   │   ├── merkle.go                // Merkle tree, leaf hashing, audit proofs
│   │   └── miner.go                 // PoW mining worker & goroutine engine
│   ├── consensus\
│   │   ├── node.go                  // Simulated P2P peer node representation
│   │   └── network.go               // Node mesh, broadcast, consensus resolution
│   ├── crypto\
│   │   ├── hash.go                  // SHA3-256 wrappers & formatting
│   │   ├── verhoeff.go              // Verhoeff checksum algorithm for Aadhaar
│   │   ├── nullifier.go             // Nullifier derivation & commitment scheme
│   │   └── mnemonic.go              // BIP-39 compatible 12-word seed generation
│   ├── election\
│   │   ├── election.go              // Election lifecycle & configuration
│   │   ├── candidate.go             // Candidate manifestos & tallies
│   │   └── tally.go                 // Cryptographic count & audit verification
│   ├── identity\
│   │   ├── aadhaar.go               // Aadhaar verification & OTP simulation
│   │   ├── epic.go                  // Voter ID (EPIC) format parser
│   │   └── voter_roll.go            // Eligible commitment store & Sybil shield
│   └── storage\
│       ├── database.go              // Pure-Go SQLite / persistence layer
│       └── repository.go            // Queries for blocks, txs, elections, nullifiers
├── web\
│   ├── static\
│   │   ├── css\
│   │   │   ├── main.css             // Web3 Obsidian Dark styling & glassmorphism
│   │   │   └── components.css       // Cards, modals, buttons, badges
│   │   ├── js\
│   │   │   ├── app.js               // Application router & state
│   │   │   ├── voting.js            // Voter registration, OTP modal, secret casting
│   │   │   ├── visualizer.js        // Canvas P2P network & SVG Merkle tree path
│   │   │   └── telemetry.js         // Live WebSocket mining & block feed
│   │   └── img\                     // Candidate portraits & badge icons
│   └── templates\
│       ├── index.html               // Dashboard & live blockchain stats
│       ├── register.html            // Aadhaar/EPIC verification & passport card
│       ├── vote.html                // Secret ballot voting booth
│       ├── explorer.html            // Block explorer & transaction inspector
│       ├── audit.html               // Merkle inclusion receipt verifier
│       └── attacks.html             // Live tamper & self-healing simulator
├── go.mod
├── go.sum
└── README.md
```

---

## 6. User Interface & Experience Specifications

The frontend will follow a **God-Tier Cyber / Web3 Aesthetic**:
1. **Theme:** Deep obsidian background (`#0b0f19`), cold dark slate cards (`#111827`), glowing cyber accents (Neon Cyan `#00f0ff`, Emerald Green `#10b981`, Vivid Amber `#f59e0b`, and Laser Purple `#8b5cf6`).
2. **Typography:** Modern geometric sans-serif (Inter & JetBrains Mono for cryptographic hashes).
3. **Interactive Components:**
   - **Live P2P Network Mesh:** HTML5 Canvas particle animation showing transactions moving from the voter to the mempool and being mined into blocks by peer nodes.
   - **Interactive Merkle Tree Graph:** Dynamic SVG diagram allowing the user to click any node, expand child leaves, and highlight the cryptographic audit path in green.
   - **Aadhaar OTP Simulation Dialog:** Realistic modal with countdown timer, auto-fill demo OTP, and instant validation badge.
   - **Voter Passport Card:** High-tech cryptographic card with copyable 12-word seed, QR code representation, and one-click ballot authentication.
   - **Interactive Tamper & Defense Control Room:** Buttons to "Inject Malicious Vote", "Trigger Double Vote", or "Corrupt Block #2", with real-time visual alerts showing the consensus rejecting the attack and restoring honest state.

---

## 7. Verification & Testing Plan

1. **Cryptographic Unit Tests (`go test ./pkg/crypto/...`):**
   - Test Verhoeff algorithm with valid/invalid Aadhaar numbers and transposition errors.
   - Verify SHA3-256 Merkle root computation and audit path proofs for 1, 2, 5, 10, and 100 leaves.
   - Test Nullifier determinism: same secret + same election = same nullifier; different election = distinct nullifier.
2. **Blockchain & Consensus Tests (`go test ./pkg/blockchain/... ./pkg/consensus/...`):**
   - Verify PoW mining satisfies difficulty target across sequential blocks.
   - Verify double-voting nullifier rejection in mempool and block validation.
   - Test tamper detection: mutating any block byte invalidates the chain.
   - Test multi-node self-healing: corrupted node recovers from honest peer.
3. **End-to-End Functional Verification:**
   - Launch application on `http://localhost:8080`.
   - Register a voter with Aadhaar & EPIC; generate Voter Passport.
   - Cast an anonymous ballot for Candidate A; verify it enters the mempool.
   - Mine the block; confirm transaction is sealed and block height increments.
   - Attempt to vote a second time with the same passport; verify immediate rejection.
   - Copy the receipt hash and verify it in the Merkle Auditor; confirm full valid path to root.
   - Simulate a tamper attack in the Auditor room; verify automatic detection and recovery.
