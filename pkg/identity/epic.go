package identity

import (
	"errors"
	"regexp"
	"strings"
)

var epicRegex = regexp.MustCompile(`^[A-Z]{3}[0-9]{7}$`)

// ValidateEPIC cleans and validates the 10-character Voter ID format (3 uppercase letters + 7 digits).
func ValidateEPIC(epic string) (string, error) {
	clean := strings.ToUpper(strings.TrimSpace(epic))
	if !epicRegex.MatchString(clean) {
		return "", errors.New("Voter ID (EPIC) must be 3 uppercase letters followed by 7 digits (e.g. ABC1234567)")
	}
	return clean, nil
}
