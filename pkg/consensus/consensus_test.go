package consensus

import (
	"testing"
	"time"

	"blockvote/pkg/blockchain"
)

func TestMeshConsensusAndSelfHealing(t *testing.T) {
	mesh := NewNetworkMesh([]string{"Node-Alpha", "Node-Beta", "Node-Gamma"}, 2)

	// Create and mine a block on Alpha
	txs := []blockchain.VoteTx{
		{
			ElectionID:    "e1",
			CandidateID:   1,
			NullifierHash: "n1",
			Timestamp:     time.Now().Unix(),
		},
	}
	txs[0].Hash = txs[0].ComputeHash()

	latest := mesh.Nodes["Node-Alpha"].Chain.GetLatestBlock()
	block, err := blockchain.MineBlock(latest, txs, 2)
	if err != nil {
		t.Fatalf("mine block failed: %v", err)
	}

	err = mesh.BroadcastBlock(block)
	if err != nil {
		t.Fatalf("broadcast failed: %v", err)
	}

	// Verify all nodes have received and validated the block
	for id, node := range mesh.Nodes {
		if len(node.Chain.Blocks) != 2 {
			t.Errorf("node %s should have 2 blocks, got %d", id, len(node.Chain.Blocks))
		}
		if !node.Chain.IsValid() {
			t.Errorf("node %s chain should be valid", id)
		}
	}

	// Simulate malicious tamper on Node-Alpha
	err = mesh.SimulateTamper("Node-Alpha", 1)
	if err != nil {
		t.Fatalf("tamper simulation failed: %v", err)
	}
	if mesh.Nodes["Node-Alpha"].Chain.IsValid() {
		t.Errorf("Node-Alpha should be detected as corrupt after tamper")
	}

	// Heal Node-Alpha from honest majority peers
	err = mesh.HealNode("Node-Alpha")
	if err != nil {
		t.Fatalf("heal failed: %v", err)
	}
	if !mesh.Nodes["Node-Alpha"].Chain.IsValid() {
		t.Errorf("Node-Alpha should be healed and valid after resync")
	}
	if mesh.Nodes["Node-Alpha"].Tampered {
		t.Errorf("Node-Alpha tampered flag should be false after healing")
	}
}
