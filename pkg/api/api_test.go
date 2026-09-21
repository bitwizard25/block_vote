package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"blockvote/pkg/blockchain"
	"blockvote/pkg/consensus"
	"blockvote/pkg/crypto"
	"blockvote/pkg/election"
	"blockvote/pkg/identity"
)

func setupTestApp() *AppState {
	voterRoll := identity.NewVoterRoll("system-salt-123")
	chain := blockchain.NewBlockchain(2)
	mempool := blockchain.NewMempool()
	mesh := consensus.NewNetworkMesh([]string{"Node-Alpha", "Node-Beta", "Node-Gamma"}, 2)
	elMgr := election.NewElectionManager()

	cands := []election.Candidate{
		{ID: 1, Name: "Candidate 1", Title: "Dr."},
		{ID: 2, Name: "Candidate 2", Title: "Prof."},
	}
	_, _ = elMgr.CreateElection("test-elect", "Test Election", "Description", cands)

	return &AppState{
		VoterRoll:       voterRoll,
		Chain:           chain,
		Mempool:         mempool,
		Mesh:            mesh,
		ElectionManager: elMgr,
		Hub:             NewHub(),
	}
}

func TestRegisterVerifyAndVoteEndpoints(t *testing.T) {
	app := setupTestApp()
	router := SetupRouter(app)

	// Step 1: Generate valid Aadhaar for test
	prefix := "84739281728"
	cd, _ := crypto.GenerateVerhoeffCheckDigit(prefix)
	aadhaar := prefix + string('0'+byte(cd))
	epic := "ABC1234567"

	regReq := map[string]string{
		"aadhaar": aadhaar,
		"epic":    epic,
	}
	body, _ := json.Marshal(regReq)
	req := httptest.NewRequest("POST", "/api/register", bytes.NewReader(body))
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("register failed with status %d: %s", w.Code, w.Body.String())
	}

	var regResp map[string]interface{}
	_ = json.Unmarshal(w.Body.Bytes(), &regResp)
	demoOTP := regResp["demo_otp"].(string)

	// Step 2: Verify OTP
	otpReq := map[string]string{
		"aadhaar": aadhaar,
		"epic":    epic,
		"otp":     demoOTP,
	}
	body, _ = json.Marshal(otpReq)
	req = httptest.NewRequest("POST", "/api/verify-otp", bytes.NewReader(body))
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("verify-otp failed with status %d: %s", w.Code, w.Body.String())
	}

	var otpResp map[string]interface{}
	_ = json.Unmarshal(w.Body.Bytes(), &otpResp)
	voterSecret := otpResp["voter_secret"].(string)

	// Step 3: Cast Vote anonymously using secret passport
	voteReq := map[string]interface{}{
		"election_id":  "test-elect",
		"candidate_id": 1,
		"voter_secret": voterSecret,
	}
	body, _ = json.Marshal(voteReq)
	req = httptest.NewRequest("POST", "/api/vote", bytes.NewReader(body))
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("vote failed with status %d: %s", w.Code, w.Body.String())
	}

	// Step 4: Check Mempool
	req = httptest.NewRequest("GET", "/api/mempool", nil)
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("mempool failed: %s", w.Body.String())
	}

	// Step 5: Mine Block
	req = httptest.NewRequest("POST", "/api/mine", nil)
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("mine failed: %s", w.Body.String())
	}

	// Step 6: Verify Double-Voting Prevention
	req = httptest.NewRequest("POST", "/api/vote", bytes.NewReader(body))
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)
	if w.Code == http.StatusOK {
		t.Fatalf("expected double vote to fail, got status 200")
	}
}
