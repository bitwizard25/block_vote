package blockchain

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"
)

// MineBlock performs Proof-of-Work to solve for the target difficulty leading zeros.
func MineBlock(prev Block, txs []VoteTx, difficulty int) (Block, error) {
	tree := NewMerkleTree(txs)
	merkleRoot := tree.GetRoot()
	target := strings.Repeat("0", difficulty)

	b := Block{
		Index:        prev.Index + 1,
		Timestamp:    time.Now().Unix(),
		PrevHash:     prev.Hash,
		MerkleRoot:   merkleRoot,
		Difficulty:   difficulty,
		Transactions: txs,
		Nonce:        0,
	}

	for {
		hash := b.CalculateHash()
		if strings.HasPrefix(hash, target) {
			b.Hash = hash
			return b, nil
		}
		b.Nonce++
	}
}

// MinerWorker manages automated block sealing in the background.
type MinerWorker struct {
	chain        *Blockchain
	mempool      *Mempool
	batchSize    int
	ctx          context.Context
	cancel       context.CancelFunc
	mu           sync.Mutex
	OnBlockMined func(b Block)
}

// NewMinerWorker initializes a mining worker.
func NewMinerWorker(bc *Blockchain, mp *Mempool, batchSize int) *MinerWorker {
	ctx, cancel := context.WithCancel(context.Background())
	return &MinerWorker{
		chain:     bc,
		mempool:   mp,
		batchSize: batchSize,
		ctx:       ctx,
		cancel:    cancel,
	}
}

// SealNow immediately mines a block from pending transactions in the mempool.
func (mw *MinerWorker) SealNow() (*Block, error) {
	mw.mu.Lock()
	defer mw.mu.Unlock()

	txs := mw.mempool.Flush()
	if len(txs) == 0 {
		return nil, fmt.Errorf("no unconfirmed transactions to seal")
	}

	prev := mw.chain.GetLatestBlock()
	block, err := MineBlock(prev, txs, mw.chain.Difficulty)
	if err != nil {
		return nil, err
	}

	if err := mw.chain.AddBlock(block); err != nil {
		return nil, err
	}

	if mw.OnBlockMined != nil {
		mw.OnBlockMined(block)
	}
	return &block, nil
}

// Start spawns a background goroutine that polls and auto-mines when the batch threshold is reached.
func (mw *MinerWorker) Start() {
	go func() {
		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-mw.ctx.Done():
				return
			case <-ticker.C:
				if mw.mempool.Count() >= mw.batchSize {
					_, _ = mw.SealNow()
				}
			}
		}
	}()
}

// Stop cancels the background mining worker.
func (mw *MinerWorker) Stop() {
	mw.cancel()
}
