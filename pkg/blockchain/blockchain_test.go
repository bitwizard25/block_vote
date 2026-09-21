package blockchain

import (
	"fmt"
	"testing"
	"time"
)

func TestMerkleTreeAndAuditProof(t *testing.T) {
	txs := make([]VoteTx, 4)
	for i := 0; i < 4; i++ {
		txs[i] = VoteTx{
			ElectionID:    "elect-1",
			CandidateID:   i + 1,
			NullifierHash: fmt.Sprintf("nullifier_%d", i),
			Timestamp:     time.Now().Unix(),
		}
		txs[i].Hash = txs[i].ComputeHash()
	}

	tree := NewMerkleTree(txs)
	root := tree.GetRoot()
	if len(root) != 64 {
		t.Fatalf("expected 64 char Merkle root, got %s", root)
	}

	// Verify proof for each transaction
	for _, tx := range txs {
		proof, err := tree.GetProof(tx.Hash)
		if err != nil {
			t.Fatalf("failed to get proof for %s: %v", tx.Hash, err)
		}
		if !VerifyProof(tx.Hash, root, proof) {
			t.Errorf("merkle proof verification failed for tx %s", tx.Hash)
		}
		// Invalid root should fail
		if VerifyProof(tx.Hash, "wrong_root_000000000000000000000000000000000000000000000000000000000", proof) {
			t.Errorf("proof should fail against wrong root")
		}
	}
}

func TestMempoolDoubleVotingRejection(t *testing.T) {
	pool := NewMempool()
	tx := VoteTx{
		ElectionID:    "elect-1",
		CandidateID:   1,
		NullifierHash: "nullifier_abc",
		Timestamp:     time.Now().Unix(),
	}
	tx.Hash = tx.ComputeHash()

	err := pool.AddTx(tx)
	if err != nil {
		t.Fatalf("first tx should succeed: %v", err)
	}

	// Replay same nullifier in same election -> must fail
	tx2 := VoteTx{
		ElectionID:    "elect-1",
		CandidateID:   2,
		NullifierHash: "nullifier_abc",
		Timestamp:     time.Now().Unix(),
	}
	tx2.Hash = tx2.ComputeHash()
	err = pool.AddTx(tx2)
	if err == nil {
		t.Errorf("expected duplicate nullifier to be rejected")
	}
}

func TestBlockchainGenesisAndChainValidation(t *testing.T) {
	chain := NewBlockchain(2) // 2 leading zeros for speed in tests
	if len(chain.Blocks) != 1 {
		t.Fatalf("expected genesis block")
	}
	if chain.Blocks[0].Index != 0 {
		t.Errorf("genesis block index should be 0")
	}
	if !chain.IsValid() {
		t.Errorf("initial chain should be valid")
	}
}
