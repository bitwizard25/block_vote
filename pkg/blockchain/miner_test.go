package blockchain

import (
	"strings"
	"testing"
	"time"
)

func TestMineBlock(t *testing.T) {
	bc := NewBlockchain(2) // 2 leading zeros for fast testing
	latest := bc.GetLatestBlock()
	txs := []VoteTx{
		{
			ElectionID:    "e1",
			CandidateID:   1,
			NullifierHash: "null1",
			Timestamp:     time.Now().Unix(),
		},
	}
	txs[0].Hash = txs[0].ComputeHash()

	block, err := MineBlock(latest, txs, 2)
	if err != nil {
		t.Fatalf("mining failed: %v", err)
	}

	target := strings.Repeat("0", 2)
	if !strings.HasPrefix(block.Hash, target) {
		t.Errorf("mined block hash %s does not start with %s", block.Hash, target)
	}
	if block.Index != latest.Index+1 {
		t.Errorf("expected index %d, got %d", latest.Index+1, block.Index)
	}
}

func TestMinerWorkerSealNow(t *testing.T) {
	bc := NewBlockchain(2)
	mp := NewMempool()
	tx := VoteTx{
		ElectionID:    "e1",
		CandidateID:   2,
		NullifierHash: "null2",
		Timestamp:     time.Now().Unix(),
	}
	tx.Hash = tx.ComputeHash()
	_ = mp.AddTx(tx)

	worker := NewMinerWorker(bc, mp, 1)
	block, err := worker.SealNow()
	if err != nil {
		t.Fatalf("SealNow failed: %v", err)
	}

	if block.Index != 1 {
		t.Errorf("expected block index 1, got %d", block.Index)
	}
	if len(bc.Blocks) != 2 {
		t.Errorf("expected 2 blocks in chain, got %d", len(bc.Blocks))
	}
	if mp.Count() != 0 {
		t.Errorf("expected mempool to be flushed after seal, got %d", mp.Count())
	}
}
