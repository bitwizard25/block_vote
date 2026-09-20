package blockchain

import (
	"fmt"

	"blockvote/pkg/crypto"
)

// VoteTx represents an anonymous, privacy-preserving vote transaction.
type VoteTx struct {
	ElectionID    string `json:"election_id"`
	CandidateID   int    `json:"candidate_id"`
	NullifierHash string `json:"nullifier_hash"`
	Timestamp     int64  `json:"timestamp"`
	Hash          string `json:"hash"`
}

// ComputeHash calculates the SHA3-256 hash of the vote transaction.
func (tx *VoteTx) ComputeHash() string {
	payload := fmt.Sprintf("%s|%d|%s|%d", tx.ElectionID, tx.CandidateID, tx.NullifierHash, tx.Timestamp)
	return crypto.SHA3String(payload)
}

// Block represents a single block in the immutable blockchain.
type Block struct {
	Index        int64    `json:"index"`
	Timestamp    int64    `json:"timestamp"`
	PrevHash     string   `json:"prev_hash"`
	MerkleRoot   string   `json:"merkle_root"`
	Hash         string   `json:"hash"`
	Nonce        int64    `json:"nonce"`
	Difficulty   int      `json:"difficulty"`
	Transactions []VoteTx `json:"transactions"`
}

// CalculateHash calculates the SHA3-256 header hash of the block.
func (b *Block) CalculateHash() string {
	payload := fmt.Sprintf("%d|%s|%s|%d|%d|%d", b.Index, b.PrevHash, b.MerkleRoot, b.Timestamp, b.Difficulty, b.Nonce)
	return crypto.SHA3String(payload)
}
