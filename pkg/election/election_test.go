package election

import (
	"testing"
	"time"

	"blockvote/pkg/blockchain"
)

func TestElectionCreationAndTally(t *testing.T) {
	mgr := NewElectionManager()
	cands := []Candidate{
		{ID: 1, Name: "Dr. Amit Thakare", Title: "Professor & HOD", Bio: "Blockchain and AI Researcher"},
		{ID: 2, Name: "Prof. Warkar Mam", Title: "Associate Professor", Bio: "Distributed Systems Specialist"},
		{ID: 3, Name: "Prof. Amit Welekar", Title: "Assistant Professor", Bio: "Cryptography and Security Expert"},
	}

	el, err := mgr.CreateElection("elect-2026", "General Faculty & Student Council Election", "Official election 2026", cands)
	if err != nil {
		t.Fatalf("failed to create election: %v", err)
	}

	chain := blockchain.NewBlockchain(2)
	txs := []blockchain.VoteTx{
		{ElectionID: el.ID, CandidateID: 1, NullifierHash: "n1", Timestamp: time.Now().Unix()},
		{ElectionID: el.ID, CandidateID: 1, NullifierHash: "n2", Timestamp: time.Now().Unix()},
		{ElectionID: el.ID, CandidateID: 2, NullifierHash: "n3", Timestamp: time.Now().Unix()},
	}
	for i := range txs {
		txs[i].Hash = txs[i].ComputeHash()
	}

	b, err := blockchain.MineBlock(chain.GetLatestBlock(), txs, 2)
	if err != nil {
		t.Fatalf("mine block failed: %v", err)
	}
	_ = chain.AddBlock(b)

	results, err := mgr.TallyResults(el.ID, chain)
	if err != nil {
		t.Fatalf("tally failed: %v", err)
	}

	if results[1] != 2 {
		t.Errorf("candidate 1 expected 2 votes, got %d", results[1])
	}
	if results[2] != 1 {
		t.Errorf("candidate 2 expected 1 vote, got %d", results[2])
	}
	if results[3] != 0 {
		t.Errorf("candidate 3 expected 0 votes, got %d", results[3])
	}
}
