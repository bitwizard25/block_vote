package blockchain

import (
	"errors"

	"blockvote/pkg/crypto"
)

// AuditProofStep describes a sibling hash and branch position in a Merkle proof.
type AuditProofStep struct {
	SiblingHash string `json:"sibling_hash"`
	IsRight     bool   `json:"is_right"`
}

// MerkleTree computes and stores a binary Merkle tree of vote transactions.
type MerkleTree struct {
	Leaves []string
	Levels [][]string
}

// NewMerkleTree constructs a binary Merkle tree from a slice of vote transactions.
func NewMerkleTree(txs []VoteTx) *MerkleTree {
	if len(txs) == 0 {
		emptyHash := crypto.SHA3String("empty_block")
		return &MerkleTree{
			Leaves: []string{emptyHash},
			Levels: [][]string{{emptyHash}},
		}
	}

	leaves := make([]string, len(txs))
	for i, tx := range txs {
		if tx.Hash == "" {
			leaves[i] = tx.ComputeHash()
		} else {
			leaves[i] = tx.Hash
		}
	}

	// Pad with duplicate leaf if odd count > 1
	current := make([]string, len(leaves))
	copy(current, leaves)
	if len(current)%2 != 0 && len(current) > 1 {
		current = append(current, current[len(current)-1])
	}

	levels := [][]string{current}
	for len(current) > 1 {
		var next []string
		for i := 0; i < len(current); i += 2 {
			if i+1 < len(current) {
				next = append(next, crypto.SHA3String(current[i]+current[i+1]))
			} else {
				next = append(next, crypto.SHA3String(current[i]+current[i]))
			}
		}
		if len(next)%2 != 0 && len(next) > 1 {
			next = append(next, next[len(next)-1])
		}
		levels = append(levels, next)
		current = next
	}

	return &MerkleTree{
		Leaves: leaves,
		Levels: levels,
	}
}

// GetRoot returns the root hash of the Merkle tree.
func (m *MerkleTree) GetRoot() string {
	if len(m.Levels) == 0 || len(m.Levels[len(m.Levels)-1]) == 0 {
		return crypto.SHA3String("empty_root")
	}
	return m.Levels[len(m.Levels)-1][0]
}

// GetProof constructs an inclusion proof for a leaf in the tree.
func (m *MerkleTree) GetProof(leafHash string) ([]AuditProofStep, error) {
	idx := -1
	for i, leaf := range m.Levels[0] {
		if leaf == leafHash {
			idx = i
			break
		}
	}
	if idx == -1 {
		return nil, errors.New("leaf not found in merkle tree")
	}

	var proof []AuditProofStep
	currentIdx := idx
	for level := 0; level < len(m.Levels)-1; level++ {
		layer := m.Levels[level]
		var siblingIdx int
		var isRight bool
		if currentIdx%2 == 0 {
			siblingIdx = currentIdx + 1
			isRight = true
		} else {
			siblingIdx = currentIdx - 1
			isRight = false
		}

		if siblingIdx < len(layer) {
			proof = append(proof, AuditProofStep{
				SiblingHash: layer[siblingIdx],
				IsRight:     isRight,
			})
		}
		currentIdx /= 2
	}
	return proof, nil
}

// VerifyProof verifies that a leaf hash matches the root via the provided proof steps.
func VerifyProof(leafHash, root string, proof []AuditProofStep) bool {
	curr := leafHash
	for _, step := range proof {
		if step.IsRight {
			curr = crypto.SHA3String(curr + step.SiblingHash)
		} else {
			curr = crypto.SHA3String(step.SiblingHash + curr)
		}
	}
	return curr == root
}
