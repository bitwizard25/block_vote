package crypto

import (
	"fmt"
	"strings"
	"testing"
)

func TestVerhoeffStandardVector(t *testing.T) {
	// Standard Verhoeff test vector: "236" has check digit 3 -> "2363"
	checkDigit, err := GenerateVerhoeffCheckDigit("236")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if checkDigit != 3 {
		t.Errorf("expected check digit 3 for '236', got %d", checkDigit)
	}
	if !ValidateVerhoeff("2363") {
		t.Errorf("expected '2363' to be valid Verhoeff")
	}
	// Tampered check digit should fail
	if ValidateVerhoeff("2364") {
		t.Errorf("expected '2364' to be invalid Verhoeff")
	}
}

func TestVerhoeffRoundTrip(t *testing.T) {
	// Test generating check digits for 11-digit prefixes and validating the 12-digit Aadhaar
	prefixes := []string{
		"84739281728",
		"20194857201",
		"54321098765",
	}
	for _, p := range prefixes {
		cd, err := GenerateVerhoeffCheckDigit(p)
		if err != nil {
			t.Fatalf("failed to generate check digit for %s: %v", p, err)
		}
		full := fmt.Sprintf("%s%d", p, cd)
		if !ValidateVerhoeff(full) {
			t.Errorf("expected generated Aadhaar %s to be valid", full)
		}
		// Single digit mutation must fail
		mutated := fmt.Sprintf("%s%d", p, (cd+1)%10)
		if ValidateVerhoeff(mutated) {
			t.Errorf("mutated check digit %s should fail validation", mutated)
		}
	}
}

func TestSHA3String(t *testing.T) {
	input := "hello blockvote"
	hash := SHA3String(input)
	if len(hash) != 64 {
		t.Fatalf("expected 64 hex chars, got %d", len(hash))
	}
	if SHA3String(input) != hash {
		t.Errorf("expected deterministic hash")
	}
}

func TestNullifierAndCommitment(t *testing.T) {
	secret := "secret-voter-key-123456789"
	salt := "system-salt"
	comm := DeriveCommitment(secret, salt)
	if len(comm) != 64 {
		t.Fatalf("expected 64 hex chars for commitment")
	}

	nullifier1 := DeriveNullifier(secret, "elect-2026-01")
	nullifier2 := DeriveNullifier(secret, "elect-2026-02")
	if nullifier1 == nullifier2 {
		t.Errorf("nullifiers for different elections must be distinct")
	}
	if DeriveNullifier(secret, "elect-2026-01") != nullifier1 {
		t.Errorf("nullifier must be deterministic for the same election")
	}
}

func TestGenerateVoterPassport(t *testing.T) {
	secret, mnemonic, err := GenerateVoterPassport()
	if err != nil {
		t.Fatalf("failed to generate voter passport: %v", err)
	}
	words := strings.Fields(mnemonic)
	if len(words) != 12 {
		t.Errorf("expected 12 mnemonic words, got %d", len(words))
	}
	if len(secret) != 64 {
		t.Errorf("expected 64 hex chars for secret, got %d", len(secret))
	}
}
