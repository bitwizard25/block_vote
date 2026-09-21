package blockchain

import (
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"blockvote/pkg/crypto"
)

// Blockchain manages the sequential chain of validated blocks.
type Blockchain struct {
	Blocks     []Block
	Difficulty int
	mu         sync.RWMutex
}

// NewBlockchain initializes the chain with the genesis block.
func NewBlockchain(difficulty int) *Blockchain {
	bc := &Blockchain{
		Blocks:     make([]Block, 0),
		Difficulty: difficulty,
	}
	genesis := Block{
		Index:        0,
		Timestamp:    time.Now().Unix(),
		PrevHash:     strings.Repeat("0", 64),
		MerkleRoot:   crypto.SHA3String("GENESIS_MERKLE_ROOT"),
		Nonce:        0,
		Difficulty:   difficulty,
		Transactions: []VoteTx{},
	}
	genesis.Hash = genesis.CalculateHash()
	bc.Blocks = append(bc.Blocks, genesis)
	return bc
}

// GetLatestBlock returns the most recent block in the chain.
func (bc *Blockchain) GetLatestBlock() Block {
	bc.mu.RLock()
	defer bc.mu.RUnlock()
	return bc.Blocks[len(bc.Blocks)-1]
}

// AddBlock validates and appends a block to the chain.
func (bc *Blockchain) AddBlock(b Block) error {
	bc.mu.Lock()
	defer bc.mu.Unlock()

	latest := bc.Blocks[len(bc.Blocks)-1]
	if b.Index != latest.Index+1 {
		return fmt.Errorf("invalid index: expected %d, got %d", latest.Index+1, b.Index)
	}
	if b.PrevHash != latest.Hash {
		return fmt.Errorf("invalid prev_hash: expected %s, got %s", latest.Hash, b.PrevHash)
	}
	if b.CalculateHash() != b.Hash {
		return errors.New("block hash does not match computed hash")
	}

	target := strings.Repeat("0", b.Difficulty)
	if !strings.HasPrefix(b.Hash, target) {
		return errors.New("block hash does not satisfy difficulty target")
	}

	bc.Blocks = append(bc.Blocks, b)
	return nil
}

// IsValid checks the cryptographic integrity of the entire chain.
func (bc *Blockchain) IsValid() bool {
	bc.mu.RLock()
	defer bc.mu.RUnlock()

	for i := 1; i < len(bc.Blocks); i++ {
		curr := bc.Blocks[i]
		prev := bc.Blocks[i-1]

		if curr.PrevHash != prev.Hash {
			return false
		}
		if curr.CalculateHash() != curr.Hash {
			return false
		}
		tree := NewMerkleTree(curr.Transactions)
		if tree.GetRoot() != curr.MerkleRoot {
			return false
		}
	}
	return true
}
