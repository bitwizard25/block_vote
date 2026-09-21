package identity

import (
	"fmt"
	"testing"

	"blockvote/pkg/crypto"
)

func TestValidateAadhaar(t *testing.T) {
	// Generate valid Aadhaar using Verhoeff
	prefix := "84739281728"
	cd, err := crypto.GenerateVerhoeffCheckDigit(prefix)
	if err != nil {
		t.Fatalf("failed to generate check digit: %v", err)
	}
	validAadhaar := fmt.Sprintf("%s%d", prefix, cd)
	t.Logf("VALID_AADHAAR: %s", validAadhaar)
	formattedAadhaar := fmt.Sprintf("%s-%s-%s", validAadhaar[0:4], validAadhaar[4:8], validAadhaar[8:12])

	clean, err := ValidateAadhaar(formattedAadhaar)
	if err != nil || clean != validAadhaar {
		t.Fatalf("expected valid clean Aadhaar %s, got %s, err: %v", validAadhaar, clean, err)
	}

	// Invalid checksum
	invalidAadhaar := fmt.Sprintf("%s%d", prefix, (cd+1)%10)
	if _, err := ValidateAadhaar(invalidAadhaar); err == nil {
		t.Errorf("expected error for invalid Aadhaar checksum")
	}

	// Invalid length
	if _, err := ValidateAadhaar("12345"); err == nil {
		t.Errorf("expected error for short Aadhaar")
	}
}

func TestValidateEPIC(t *testing.T) {
	valid := "ABC1234567"
	clean, err := ValidateEPIC("abc1234567")
	if err != nil || clean != valid {
		t.Fatalf("expected uppercase valid EPIC %s, got %s, err: %v", valid, clean, err)
	}

	invalidEPICs := []string{"AB1234567", "ABCD123456", "ABC123456", "1234567890", "ABC12345678"}
	for _, epic := range invalidEPICs {
		if _, err := ValidateEPIC(epic); err == nil {
			t.Errorf("expected error for invalid EPIC: %s", epic)
		}
	}
}

func TestOTPFlow(t *testing.T) {
	aadhaar := "847392817283"
	otp := GenerateOTP(aadhaar)
	if len(otp) != 6 {
		t.Fatalf("expected 6-digit OTP, got %s", otp)
	}
	if !VerifyOTP(aadhaar, otp) {
		t.Errorf("expected OTP verification to succeed")
	}
	if VerifyOTP(aadhaar, "000000") && otp != "000000" {
		t.Errorf("expected wrong OTP to fail")
	}
}

func TestVoterRollSybilPrevention(t *testing.T) {
	roll := NewVoterRoll("test-system-salt")
	aadhaar := "847392817283"
	epic := "ABC1234567"
	comm := "commitment_hash_1"

	err := roll.Register(aadhaar, epic, comm)
	if err != nil {
		t.Fatalf("registration should succeed: %v", err)
	}

	// Attempt duplicate registration with same Aadhaar
	err = roll.Register(aadhaar, "XYZ9876543", "commitment_hash_2")
	if err == nil {
		t.Errorf("expected duplicate Aadhaar registration to fail")
	}

	// Attempt duplicate registration with same EPIC
	err = roll.Register("799273987130", epic, "commitment_hash_3")
	if err == nil {
		t.Errorf("expected duplicate EPIC registration to fail")
	}

	if !roll.IsCommitmentRegistered(comm) {
		t.Errorf("commitment should be registered in voter roll")
	}

	if roll.Count() != 1 {
		t.Errorf("expected voter count 1, got %d", roll.Count())
	}
}
