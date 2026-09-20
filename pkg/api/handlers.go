package api

import (
	"encoding/json"
	"net/http"
	"time"

	"blockvote/pkg/blockchain"
	"blockvote/pkg/consensus"
	"blockvote/pkg/crypto"
	"blockvote/pkg/election"
	"blockvote/pkg/identity"
)

// AppState bundles shared state across services.
type AppState struct {
	VoterRoll       *identity.VoterRoll
	Chain           *blockchain.Blockchain
	Mempool         *blockchain.Mempool
	Mesh            *consensus.NetworkMesh
	ElectionManager *election.ElectionManager
	Hub             *Hub
}

// SetupRouter configures all REST routes and WebSocket handlers.
func SetupRouter(app *AppState) http.Handler {
	mux := http.NewServeMux()

	// WebSocket real-time telemetry
	mux.HandleFunc("/ws", app.Hub.HandleWebSocket)

	// POST /api/register
	mux.HandleFunc("/api/register", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var req struct {
			Aadhaar string `json:"aadhaar"`
			EPIC    string `json:"epic"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		cleanAadhaar, err := identity.ValidateAadhaar(req.Aadhaar)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		cleanEPIC, err := identity.ValidateEPIC(req.EPIC)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		otp := identity.GenerateOTP(cleanAadhaar)
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":   "OTP_SENT",
			"aadhaar":  cleanAadhaar,
			"epic":     cleanEPIC,
			"demo_otp": otp,
		})
	})

	// POST /api/verify-otp
	mux.HandleFunc("/api/verify-otp", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var req struct {
			Aadhaar string `json:"aadhaar"`
			EPIC    string `json:"epic"`
			OTP     string `json:"otp"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		cleanAadhaar, err := identity.ValidateAadhaar(req.Aadhaar)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if !identity.VerifyOTP(cleanAadhaar, req.OTP) {
			http.Error(w, "invalid or expired OTP", http.StatusUnauthorized)
			return
		}

		secret, mnemonic, err := crypto.GenerateVoterPassport()
		if err != nil {
			http.Error(w, "failed to generate passport", http.StatusInternalServerError)
			return
		}

		commitment := crypto.DeriveCommitment(secret, "voter-salt")
		if err := app.VoterRoll.Register(cleanAadhaar, req.EPIC, commitment); err != nil {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":       "REGISTERED",
			"voter_secret": secret,
			"mnemonic":     mnemonic,
			"commitment":   commitment,
		})
	})

	// GET /api/elections
	mux.HandleFunc("/api/elections", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		elections := app.ElectionManager.GetAllElections()
		// Attach real-time tally to each candidate
		for _, el := range elections {
			tallies, err := app.ElectionManager.TallyResults(el.ID, app.Chain)
			if err == nil {
				for i := range el.Candidates {
					el.Candidates[i].VoteCount = tallies[el.Candidates[i].ID]
				}
			}
		}
		_ = json.NewEncoder(w).Encode(elections)
	})

	// POST /api/vote
	mux.HandleFunc("/api/vote", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var req struct {
			ElectionID  string `json:"election_id"`
			CandidateID int    `json:"candidate_id"`
			VoterSecret string `json:"voter_secret"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		if req.VoterSecret == "" {
			http.Error(w, "voter secret key is required", http.StatusBadRequest)
			return
		}

		nullifier := crypto.DeriveNullifier(req.VoterSecret, req.ElectionID)
		tx := blockchain.VoteTx{
			ElectionID:    req.ElectionID,
			CandidateID:   req.CandidateID,
			NullifierHash: nullifier,
			Timestamp:     time.Now().Unix(),
		}
		tx.Hash = tx.ComputeHash()

		if err := app.Mempool.AddTx(tx); err != nil {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}

		app.Hub.Broadcast("VOTE_CAST", map[string]interface{}{
			"tx_hash":     tx.Hash,
			"election_id": tx.ElectionID,
			"timestamp":   tx.Timestamp,
		})

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":       "SUBMITTED_TO_MEMPOOL",
			"receipt_hash": tx.Hash,
			"nullifier":    nullifier,
		})
	})

	// GET /api/mempool
	mux.HandleFunc("/api/mempool", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(app.Mempool.GetPending())
	})

	// POST /api/mine
	mux.HandleFunc("/api/mine", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		txs := app.Mempool.Flush()
		if len(txs) == 0 {
			http.Error(w, "mempool is empty", http.StatusBadRequest)
			return
		}

		prev := app.Chain.GetLatestBlock()
		block, err := blockchain.MineBlock(prev, txs, app.Chain.Difficulty)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if err := app.Chain.AddBlock(block); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		_ = app.Mesh.BroadcastBlock(block)

		app.Hub.Broadcast("BLOCK_MINED", block)

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(block)
	})

	// GET /api/blocks
	mux.HandleFunc("/api/blocks", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(app.Chain.Blocks)
	})

	// POST /api/audit
	mux.HandleFunc("/api/audit", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var req struct {
			ReceiptHash string `json:"receipt_hash"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid body", http.StatusBadRequest)
			return
		}

		for _, b := range app.Chain.Blocks {
			tree := blockchain.NewMerkleTree(b.Transactions)
			proof, err := tree.GetProof(req.ReceiptHash)
			if err == nil {
				w.Header().Set("Content-Type", "application/json")
				_ = json.NewEncoder(w).Encode(map[string]interface{}{
					"found":        true,
					"block_index":  b.Index,
					"block_hash":   b.Hash,
					"merkle_root":  b.MerkleRoot,
					"proof":        proof,
					"verified":     blockchain.VerifyProof(req.ReceiptHash, b.MerkleRoot, proof),
				})
				return
			}
		}

		http.Error(w, "receipt hash not found in blockchain", http.StatusNotFound)
	})

	// POST /api/simulate-tamper
	mux.HandleFunc("/api/simulate-tamper", func(w http.ResponseWriter, r *http.Request) {
		targetIndex := int64(1)
		if len(app.Chain.Blocks) < 2 {
			http.Error(w, "at least 1 mined block required to simulate tamper", http.StatusBadRequest)
			return
		}
		if err := app.Mesh.SimulateTamper("Node-Alpha", targetIndex); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		app.Hub.Broadcast("TAMPER_ALERT", map[string]string{
			"node_id": "Node-Alpha",
			"status":  "CORRUPTED",
		})
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{
			"status":  "TAMPER_INJECTED",
			"message": "Node-Alpha database manipulated! Merkle root corrupted.",
		})
	})

	// POST /api/heal-node
	mux.HandleFunc("/api/heal-node", func(w http.ResponseWriter, r *http.Request) {
		if err := app.Mesh.HealNode("Node-Alpha"); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		app.Hub.Broadcast("NODE_HEALED", map[string]string{
			"node_id": "Node-Alpha",
			"status":  "RESTORED_HONEST_STATE",
		})
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{
			"status":  "HEALED",
			"message": "Node-Alpha blockchain state restored from majority honest peer.",
		})
	})

	// GET /api/node-status
	mux.HandleFunc("/api/node-status", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(app.Mesh.GetNodeStatus())
	})

	return mux
}
