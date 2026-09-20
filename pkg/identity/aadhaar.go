package identity

import (
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"blockvote/pkg/crypto"
)

var (
	otpStore = make(map[string]otpEntry)
	otpMutex sync.RWMutex
)

type otpEntry struct {
	otp       string
	expiresAt time.Time
}

// ValidateAadhaar cleans formatted strings and validates the 12-digit number via Verhoeff.
func ValidateAadhaar(aadhaar string) (string, error) {
	clean := strings.ReplaceAll(strings.ReplaceAll(aadhaar, "-", ""), " ", "")
	if len(clean) != 12 {
		return "", errors.New("Aadhaar must be exactly 12 digits")
	}
	if !crypto.ValidateVerhoeff(clean) {
		return "", errors.New("invalid Aadhaar checksum")
	}
	return clean, nil
}

// GenerateOTP simulates UIDAI OTP challenge for a verified Aadhaar number.
func GenerateOTP(aadhaar string) string {
	otpMutex.Lock()
	defer otpMutex.Unlock()

	hash := crypto.SHA3String(fmt.Sprintf("%s:%d", aadhaar, time.Now().Unix()/300))
	otp := fmt.Sprintf("%06d", (int(hash[0])<<16|int(hash[1])<<8|int(hash[2]))%1000000)
	otpStore[aadhaar] = otpEntry{
		otp:       otp,
		expiresAt: time.Now().Add(5 * time.Minute),
	}
	return otp
}

// VerifyOTP verifies the challenge OTP submitted by the voter.
func VerifyOTP(aadhaar, otp string) bool {
	otpMutex.RLock()
	defer otpMutex.RUnlock()
	entry, ok := otpStore[aadhaar]
	if !ok || time.Now().After(entry.expiresAt) {
		return false
	}
	return entry.otp == otp
}
