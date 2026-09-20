package consensus

import (
	"blockvote/pkg/blockchain"
)

// PeerNode simulates an independent node in the P2P network.
type PeerNode struct {
	ID       string                 `json:"id"`
	Chain    *blockchain.Blockchain `json:"chain"`
	IsHonest bool                   `json:"is_honest"`
	Tampered bool                   `json:"tampered"`
}

// NewPeerNode creates a new simulated peer validator.
func NewPeerNode(id string, difficulty int) *PeerNode {
	return &PeerNode{
		ID:       id,
		Chain:    blockchain.NewBlockchain(difficulty),
		IsHonest: true,
		Tampered: false,
	}
}
