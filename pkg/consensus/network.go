package consensus

import (
	"errors"
	"fmt"
	"sync"

	"blockvote/pkg/blockchain"
)

// NetworkMesh manages peer nodes, block broadcasting, and automated self-healing.
type NetworkMesh struct {
	Nodes map[string]*PeerNode `json:"nodes"`
	mu    sync.RWMutex
}

// NewNetworkMesh initializes a mesh with the specified node IDs.
func NewNetworkMesh(nodeIDs []string, difficulty int) *NetworkMesh {
	mesh := &NetworkMesh{
		Nodes: make(map[string]*PeerNode),
	}
	for _, id := range nodeIDs {
		mesh.Nodes[id] = NewPeerNode(id, difficulty)
	}
	return mesh
}

// BroadcastBlock broadcasts a newly mined block to all honest peers.
func (nm *NetworkMesh) BroadcastBlock(b blockchain.Block) error {
	nm.mu.Lock()
	defer nm.mu.Unlock()

	for id, node := range nm.Nodes {
		if !node.IsHonest || node.Tampered {
			continue
		}
		if err := node.Chain.AddBlock(b); err != nil {
			return fmt.Errorf("node %s rejected block: %w", id, err)
		}
	}
	return nil
}

// SimulateTamper mutates a block's Merkle root and transaction in a target node.
func (nm *NetworkMesh) SimulateTamper(nodeID string, blockIndex int64) error {
	nm.mu.Lock()
	defer nm.mu.Unlock()

	node, ok := nm.Nodes[nodeID]
	if !ok {
		return errors.New("node not found")
	}
	if blockIndex <= 0 || int(blockIndex) >= len(node.Chain.Blocks) {
		return errors.New("invalid block index")
	}

	if len(node.Chain.Blocks[blockIndex].Transactions) > 0 {
		node.Chain.Blocks[blockIndex].Transactions[0].CandidateID = 999
	}
	node.Chain.Blocks[blockIndex].MerkleRoot = "corrupted_merkle_root_ffffffffffffffffffffffffffffffffffffff"
	node.Tampered = true
	return nil
}

// HealNode recovers a corrupted node's blockchain state from an honest peer.
func (nm *NetworkMesh) HealNode(nodeID string) error {
	nm.mu.Lock()
	defer nm.mu.Unlock()

	node, ok := nm.Nodes[nodeID]
	if !ok {
		return errors.New("node not found")
	}

	// Locate an honest peer with valid chain
	var honestNode *PeerNode
	for id, peer := range nm.Nodes {
		if id != nodeID && peer.Chain.IsValid() {
			honestNode = peer
			break
		}
	}
	if honestNode == nil {
		return errors.New("no honest peer available for state synchronization")
	}

	// Restore honest chain state
	restoredBlocks := make([]blockchain.Block, len(honestNode.Chain.Blocks))
	copy(restoredBlocks, honestNode.Chain.Blocks)
	node.Chain.Blocks = restoredBlocks
	node.Tampered = false
	return nil
}

// GetNodeStatus returns honesty and validity status for all nodes.
func (nm *NetworkMesh) GetNodeStatus() map[string]map[string]interface{} {
	nm.mu.RLock()
	defer nm.mu.RUnlock()

	status := make(map[string]map[string]interface{})
	for id, node := range nm.Nodes {
		status[id] = map[string]interface{}{
			"is_honest":    node.IsHonest,
			"tampered":     node.Tampered,
			"is_valid":     node.Chain.IsValid(),
			"block_height": len(node.Chain.Blocks),
		}
	}
	return status
}
