package identity

import (
	"errors"
	"sync"

	"blockvote/pkg/crypto"
)

// VoterRoll maintains the registry of eligible voters using one-way salted hashes and commitments.
type VoterRoll struct {
	systemSalt  string
	registered  map[string]bool // hashed Aadhaar -> true
	epicHash    map[string]bool // hashed EPIC -> true
	commitments map[string]bool // commitment -> true
	mu          sync.RWMutex
}

func NewVoterRoll(salt string) *VoterRoll {
	return &VoterRoll{
		systemSalt:  salt,
		registered:  make(map[string]bool),
		epicHash:    make(map[string]bool),
		commitments: make(map[string]bool),
	}
}

func (vr *VoterRoll) Register(aadhaar, epic, commitment string) error {
	vr.mu.Lock()
	defer vr.mu.Unlock()

	aHash := crypto.SHA3String(aadhaar + ":" + vr.systemSalt)
	eHash := crypto.SHA3String(epic + ":" + vr.systemSalt)

	if vr.registered[aHash] {
		return errors.New("this Aadhaar number has already been registered")
	}
	if vr.epicHash[eHash] {
		return errors.New("this Voter ID (EPIC) has already been registered")
	}

	vr.registered[aHash] = true
	vr.epicHash[eHash] = true
	vr.commitments[commitment] = true
	return nil
}

func (vr *VoterRoll) IsCommitmentRegistered(commitment string) bool {
	vr.mu.RLock()
	defer vr.mu.RUnlock()
	return vr.commitments[commitment]
}

func (vr *VoterRoll) IsCitizenRegistered(aadhaar, epic string) bool {
	vr.mu.RLock()
	defer vr.mu.RUnlock()
	aHash := crypto.SHA3String(aadhaar + ":" + vr.systemSalt)
	eHash := crypto.SHA3String(epic + ":" + vr.systemSalt)
	return vr.registered[aHash] || vr.epicHash[eHash]
}

func (vr *VoterRoll) Count() int {
	vr.mu.RLock()
	defer vr.mu.RUnlock()
	return len(vr.commitments)
}
