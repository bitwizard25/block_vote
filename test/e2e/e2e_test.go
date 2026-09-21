package e2e_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"blockvote/pkg/api"
	"blockvote/pkg/blockchain"
	"blockvote/pkg/consensus"
	"blockvote/pkg/crypto"
	"blockvote/pkg/election"
	"blockvote/pkg/identity"
)

func setupTestServer() (*httptest.Server, *api.AppState) {
	voterRoll := identity.NewVoterRoll("test-master-salt-e2e")
	chain := blockchain.NewBlockchain(1) // low difficulty for fast test execution
	mempool := blockchain.NewMempool()
	mesh := consensus.NewNetworkMesh([]string{"Node-Alpha", "Node-Beta", "Node-Gamma"}, 1)
	elMgr := election.NewElectionManager()
	hub := api.NewHub()

	candidates := []election.Candidate{
		{ID: 1, Name: "Candidate Alpha", Title: "Professor", Bio: "Lead Alpha", ImageURL: "/static/img/amit_thaker.jpeg"},
		{ID: 2, Name: "Candidate Beta", Title: "Researcher", Bio: "Lead Beta", ImageURL: "/static/img/madam_ji.jpeg"},
	}
	_, _ = elMgr.CreateElection("e2e_election_2026", "National Governance 2026", "E2E Test Election", candidates)

	state := &api.AppState{
		VoterRoll:       voterRoll,
		Chain:           chain,
		Mempool:         mempool,
		Mesh:            mesh,
		ElectionManager: elMgr,
		Hub:             hub,
	}

	router := api.SetupRouter(state)
	server := httptest.NewServer(router)
	return server, state
}

func TestFullE2EVotingLifecycle(t *testing.T) {
	server, _ := setupTestServer()
	defer server.Close()

	client := server.Client()

	// 1. Register Citizen 1 (Aadhaar with valid Verhoeff checksum: 8473-9281-7287)
	regPayload := map[string]string{
		"aadhaar": "8473-9281-7287",
		"epic":    "ABC1234567",
	}
	bodyBytes, _ := json.Marshal(regPayload)
	res, err := client.Post(server.URL+"/api/register", "application/json", bytes.NewReader(bodyBytes))
	if err != nil {
		t.Fatalf("Register request failed: %v", err)
	}
	if res.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK on register, got %d", res.StatusCode)
	}
	var regResp map[string]interface{}
	json.NewDecoder(res.Body).Decode(&regResp)
	res.Body.Close()

	demoOtp := regResp["demo_otp"].(string)
	if len(demoOtp) != 6 {
		t.Fatalf("Expected 6-digit OTP, got %s", demoOtp)
	}

	// 2. Verify OTP for Citizen 1
	verifyPayload := map[string]string{
		"aadhaar": "8473-9281-7287",
		"epic":    "ABC1234567",
		"otp":     demoOtp,
	}
	bodyBytes, _ = json.Marshal(verifyPayload)
	res, err = client.Post(server.URL+"/api/verify-otp", "application/json", bytes.NewReader(bodyBytes))
	if err != nil {
		t.Fatalf("Verify OTP request failed: %v", err)
	}
	if res.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK on verify-otp, got %d", res.StatusCode)
	}
	var verifyResp map[string]interface{}
	json.NewDecoder(res.Body).Decode(&verifyResp)
	res.Body.Close()

	voterSecret1 := verifyResp["voter_secret"].(string)
	mnemonic1 := verifyResp["mnemonic"].(string)
	if len(voterSecret1) != 64 {
		t.Fatalf("Expected 64-char voter secret, got %d", len(voterSecret1))
	}
	words := strings.Fields(mnemonic1)
	if len(words) != 12 {
		t.Fatalf("Expected 12-word mnemonic passport, got %d words", len(words))
	}

	// 3. Sybil Test: Citizen 1 attempts to re-register -> Must Be Rejected
	bodyBytes, _ = json.Marshal(regPayload)
	res, _ = client.Post(server.URL+"/api/register", "application/json", bytes.NewReader(bodyBytes))
	if res.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request on duplicate citizen registration, got %d", res.StatusCode)
	}
	res.Body.Close()

	// 4. Fetch Active Election
	res, err = client.Get(server.URL + "/api/elections")
	if err != nil {
		t.Fatalf("Fetch elections failed: %v", err)
	}
	var elections []map[string]interface{}
	json.NewDecoder(res.Body).Decode(&elections)
	res.Body.Close()
	if len(elections) == 0 {
		t.Fatalf("Expected at least 1 election, got 0")
	}
	electionID := elections[0]["id"].(string)

	// 5. Cast Ballot for Candidate 1
	votePayload := map[string]interface{}{
		"election_id":  electionID,
		"candidate_id": 1,
		"voter_secret": voterSecret1,
	}
	bodyBytes, _ = json.Marshal(votePayload)
	res, err = client.Post(server.URL+"/api/vote", "application/json", bytes.NewReader(bodyBytes))
	if err != nil {
		t.Fatalf("Vote request failed: %v", err)
	}
	if res.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(res.Body)
		t.Fatalf("Expected 200 OK on vote, got %d: %s", res.StatusCode, string(b))
	}
	var voteResp1 map[string]interface{}
	json.NewDecoder(res.Body).Decode(&voteResp1)
	res.Body.Close()
	receiptHash1 := voteResp1["receipt_hash"].(string)
	if len(receiptHash1) != 64 {
		t.Fatalf("Expected 64-char receipt hash, got %s", receiptHash1)
	}

	// 6. Sybil Attack: Citizen 1 attempts to vote a second time -> Must be rejected by Nullifier Registry
	votePayloadDup := map[string]interface{}{
		"election_id":  electionID,
		"candidate_id": 2,
		"voter_secret": voterSecret1,
	}
	bodyBytes, _ = json.Marshal(votePayloadDup)
	res, _ = client.Post(server.URL+"/api/vote", "application/json", bytes.NewReader(bodyBytes))
	if res.StatusCode != http.StatusConflict {
		t.Fatalf("Expected 409 Conflict on double vote nullifier collision, got %d", res.StatusCode)
	}
	res.Body.Close()

	// 7. Register Citizen 2 (compute valid Verhoeff for prefix 99991111222)
	c2Prefix := "99991111222"
	c2Check, _ := crypto.GenerateVerhoeffCheckDigit(c2Prefix)
	c2Aadhaar := c2Prefix + string(rune('0'+c2Check))
	c2EPIC := "XYZ9876543"

	c2RegPayload := map[string]string{"aadhaar": c2Aadhaar, "epic": c2EPIC}
	bodyBytes, _ = json.Marshal(c2RegPayload)
	res, err = client.Post(server.URL+"/api/register", "application/json", bytes.NewReader(bodyBytes))
	if err != nil || res.StatusCode != http.StatusOK {
		t.Fatalf("Citizen 2 register failed")
	}
	var c2RegResp map[string]interface{}
	json.NewDecoder(res.Body).Decode(&c2RegResp)
	res.Body.Close()

	// 8. Verify OTP for Citizen 2
	c2VerifyPayload := map[string]string{
		"aadhaar": c2Aadhaar,
		"epic":    c2EPIC,
		"otp":     c2RegResp["demo_otp"].(string),
	}
	bodyBytes, _ = json.Marshal(c2VerifyPayload)
	res, _ = client.Post(server.URL+"/api/verify-otp", "application/json", bytes.NewReader(bodyBytes))
	var c2VerifyResp map[string]interface{}
	json.NewDecoder(res.Body).Decode(&c2VerifyResp)
	res.Body.Close()
	voterSecret2 := c2VerifyResp["voter_secret"].(string)

	// 9. Cast Ballot for Candidate 2
	c2VotePayload := map[string]interface{}{
		"election_id":  electionID,
		"candidate_id": 2,
		"voter_secret": voterSecret2,
	}
	bodyBytes, _ = json.Marshal(c2VotePayload)
	res, _ = client.Post(server.URL+"/api/vote", "application/json", bytes.NewReader(bodyBytes))
	var voteResp2 map[string]interface{}
	json.NewDecoder(res.Body).Decode(&voteResp2)
	res.Body.Close()
	receiptHash2 := voteResp2["receipt_hash"].(string)

	// 10. Check Mempool: 2 votes must be staged
	res, _ = client.Get(server.URL + "/api/mempool")
	var mempoolTxs []map[string]interface{}
	json.NewDecoder(res.Body).Decode(&mempoolTxs)
	res.Body.Close()
	if len(mempoolTxs) != 2 {
		t.Fatalf("Expected 2 transactions in mempool, got %d", len(mempoolTxs))
	}

	// 11. Mine Block via PoW
	res, err = client.Post(server.URL+"/api/mine", "application/json", nil)
	if err != nil || res.StatusCode != http.StatusOK {
		t.Fatalf("Mine block failed: %v", err)
	}
	var minedBlock map[string]interface{}
	json.NewDecoder(res.Body).Decode(&minedBlock)
	res.Body.Close()

	if minedBlock["index"].(float64) != 1 {
		t.Fatalf("Expected Block Index 1, got %v", minedBlock["index"])
	}

	// 12. Check Mempool is now empty
	res, _ = client.Get(server.URL + "/api/mempool")
	var mempoolAfter []map[string]interface{}
	json.NewDecoder(res.Body).Decode(&mempoolAfter)
	res.Body.Close()
	if len(mempoolAfter) != 0 {
		t.Fatalf("Expected 0 transactions in mempool after mining, got %d", len(mempoolAfter))
	}

	// 13. Verify Candidate Tallies in Election
	res, _ = client.Get(server.URL + "/api/elections")
	var updatedElections []election.Election
	json.NewDecoder(res.Body).Decode(&updatedElections)
	res.Body.Close()
	cand1Votes := updatedElections[0].Candidates[0].VoteCount
	cand2Votes := updatedElections[0].Candidates[1].VoteCount
	if cand1Votes != 1 || cand2Votes != 1 {
		t.Fatalf("Expected candidate 1=1 vote and candidate 2=1 vote, got cand1=%d cand2=%d", cand1Votes, cand2Votes)
	}

	// 14. Merkle Audit for Receipt 1
	auditPayload1 := map[string]string{"receipt_hash": receiptHash1}
	bodyBytes, _ = json.Marshal(auditPayload1)
	res, _ = client.Post(server.URL+"/api/audit", "application/json", bytes.NewReader(bodyBytes))
	var auditResp1 map[string]interface{}
	json.NewDecoder(res.Body).Decode(&auditResp1)
	res.Body.Close()
	if auditResp1["verified"] != true {
		t.Fatalf("Expected receipt 1 to be verified in Merkle Tree")
	}
	if auditResp1["candidate_id"].(float64) != 1 {
		t.Fatalf("Expected candidate_id 1 in audit proof, got %v", auditResp1["candidate_id"])
	}

	// 15. Merkle Audit for Receipt 2
	auditPayload2 := map[string]string{"receipt_hash": receiptHash2}
	bodyBytes, _ = json.Marshal(auditPayload2)
	res, _ = client.Post(server.URL+"/api/audit", "application/json", bytes.NewReader(bodyBytes))
	var auditResp2 map[string]interface{}
	json.NewDecoder(res.Body).Decode(&auditResp2)
	res.Body.Close()
	if auditResp2["verified"] != true {
		t.Fatalf("Expected receipt 2 to be verified in Merkle Tree")
	}
	if auditResp2["candidate_id"].(float64) != 2 {
		t.Fatalf("Expected candidate_id 2 in audit proof, got %v", auditResp2["candidate_id"])
	}

	// 16. Consensus Byzantine Fault Tolerance: Simulate Tamper
	res, _ = client.Post(server.URL+"/api/simulate-tamper", "application/json", nil)
	if res.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK on simulate-tamper, got %d", res.StatusCode)
	}
	res.Body.Close()

	// Check Node Status: Node-Alpha should be tampered
	res, _ = client.Get(server.URL + "/api/node-status")
	var statusMap map[string]map[string]interface{}
	json.NewDecoder(res.Body).Decode(&statusMap)
	res.Body.Close()
	if statusMap["Node-Alpha"]["tampered"] != true {
		t.Fatalf("Expected Node-Alpha to be flagged as tampered")
	}

	// 17. Consensus Self-Healing: Heal Node-Alpha
	res, _ = client.Post(server.URL+"/api/heal-node", "application/json", nil)
	if res.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK on heal-node, got %d", res.StatusCode)
	}
	res.Body.Close()

	// Verify Node Status: Node-Alpha should now be synchronized & untampered
	res, _ = client.Get(server.URL + "/api/node-status")
	json.NewDecoder(res.Body).Decode(&statusMap)
	res.Body.Close()
	if statusMap["Node-Alpha"]["tampered"] != false {
		t.Fatalf("Expected Node-Alpha to be healed and not tampered")
	}
}
