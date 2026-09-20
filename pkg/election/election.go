package election

import (
	"errors"
	"sync"
	"time"

	"blockvote/pkg/blockchain"
)

type ElectionStatus string

const (
	StatusActive ElectionStatus = "ACTIVE"
	StatusClosed ElectionStatus = "CLOSED"
)

// Election defines an election instance with candidates and status.
type Election struct {
	ID          string         `json:"id"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Status      ElectionStatus `json:"status"`
	Candidates  []Candidate    `json:"candidates"`
	CreatedAt   int64          `json:"created_at"`
}

// ElectionManager oversees election creation and decentralized tallies.
type ElectionManager struct {
	elections map[string]*Election
	mu        sync.RWMutex
}

func NewElectionManager() *ElectionManager {
	return &ElectionManager{
		elections: make(map[string]*Election),
	}
}

// CreateElection adds a new election to the system.
func (em *ElectionManager) CreateElection(id, title, desc string, cands []Candidate) (*Election, error) {
	em.mu.Lock()
	defer em.mu.Unlock()

	if _, exists := em.elections[id]; exists {
		return nil, errors.New("election with this ID already exists")
	}

	el := &Election{
		ID:          id,
		Title:       title,
		Description: desc,
		Status:      StatusActive,
		Candidates:  cands,
		CreatedAt:   time.Now().Unix(),
	}
	em.elections[id] = el
	return el, nil
}

// GetElection retrieves an election by its unique ID.
func (em *ElectionManager) GetElection(id string) (*Election, error) {
	em.mu.RLock()
	defer em.mu.RUnlock()
	el, ok := em.elections[id]
	if !ok {
		return nil, errors.New("election not found")
	}
	return el, nil
}

// GetAllElections returns all available elections.
func (em *ElectionManager) GetAllElections() []*Election {
	em.mu.RLock()
	defer em.mu.RUnlock()
	list := make([]*Election, 0, len(em.elections))
	for _, el := range em.elections {
		list = append(list, el)
	}
	return list
}

// TallyResults computes total votes for each candidate from the immutable blockchain ledger.
func (em *ElectionManager) TallyResults(electionID string, chain *blockchain.Blockchain) (map[int]int, error) {
	el, err := em.GetElection(electionID)
	if err != nil {
		return nil, err
	}

	tallies := make(map[int]int)
	for _, c := range el.Candidates {
		tallies[c.ID] = 0
	}

	for _, block := range chain.Blocks {
		for _, tx := range block.Transactions {
			if tx.ElectionID == electionID {
				tallies[tx.CandidateID]++
			}
		}
	}
	return tallies, nil
}
