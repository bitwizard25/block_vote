package blockchain

import (
	"errors"
	"sync"
)

// Mempool holds unconfirmed transactions with double-voting nullifier checks.
type Mempool struct {
	txs             []VoteTx
	spentNullifiers map[string]bool // electionID:nullifier -> true
	mu              sync.RWMutex
}

// NewMempool creates a thread-safe mempool.
func NewMempool() *Mempool {
	return &Mempool{
		txs:             make([]VoteTx, 0),
		spentNullifiers: make(map[string]bool),
	}
}

// AddTx adds an unconfirmed transaction to the pool or returns an error if the nullifier was already spent.
func (mp *Mempool) AddTx(tx VoteTx) error {
	mp.mu.Lock()
	defer mp.mu.Unlock()

	key := tx.ElectionID + ":" + tx.NullifierHash
	if mp.spentNullifiers[key] {
		return errors.New("FRAUD ALERT: nullifier has already voted in this election")
	}

	mp.spentNullifiers[key] = true
	mp.txs = append(mp.txs, tx)
	return nil
}

// Flush extracts all pending transactions for block sealing and empties the pool.
func (mp *Mempool) Flush() []VoteTx {
	mp.mu.Lock()
	defer mp.mu.Unlock()
	batch := mp.txs
	mp.txs = make([]VoteTx, 0)
	return batch
}

// GetPending returns a copy of pending transactions.
func (mp *Mempool) GetPending() []VoteTx {
	mp.mu.RLock()
	defer mp.mu.RUnlock()
	copied := make([]VoteTx, len(mp.txs))
	copy(copied, mp.txs)
	return copied
}

// Count returns the number of pending transactions.
func (mp *Mempool) Count() int {
	mp.mu.RLock()
	defer mp.mu.RUnlock()
	return len(mp.txs)
}
