package crypto

import (
	"errors"
	"fmt"
	"unicode"
)

// Verhoeff algorithm lookup tables
var (
	// Multiplication table (d)
	d = [10][10]int{
		{0, 1, 2, 3, 4, 5, 6, 7, 8, 9},
		{1, 2, 3, 4, 0, 6, 7, 8, 9, 5},
		{2, 3, 4, 0, 1, 7, 8, 9, 5, 6},
		{3, 4, 0, 1, 2, 8, 9, 5, 6, 7},
		{4, 0, 1, 2, 3, 9, 5, 6, 7, 8},
		{5, 9, 8, 7, 6, 0, 4, 3, 2, 1},
		{6, 5, 9, 8, 7, 1, 0, 4, 3, 2},
		{7, 6, 5, 9, 8, 2, 1, 0, 4, 3},
		{8, 7, 6, 5, 9, 3, 2, 1, 0, 4},
		{9, 8, 7, 6, 5, 4, 3, 2, 1, 0},
	}

	// Permutation table (p)
	p = [8][10]int{
		{0, 1, 2, 3, 4, 5, 6, 7, 8, 9},
		{1, 5, 7, 6, 2, 8, 3, 0, 9, 4},
		{5, 8, 0, 3, 7, 9, 6, 1, 4, 2},
		{8, 9, 1, 6, 0, 4, 3, 5, 2, 7},
		{9, 4, 5, 3, 1, 2, 6, 8, 7, 0},
		{4, 2, 8, 6, 5, 7, 3, 9, 0, 1},
		{2, 7, 9, 3, 8, 0, 6, 4, 1, 5},
		{7, 0, 4, 6, 9, 1, 3, 2, 5, 8},
	}

	// Inverse table (inv)
	inv = [10]int{0, 4, 3, 2, 1, 5, 6, 7, 8, 9}
)

// GenerateVerhoeffCheckDigit calculates the Verhoeff check digit for a string of digits.
func GenerateVerhoeffCheckDigit(num string) (int, error) {
	if len(num) == 0 {
		return 0, errors.New("empty string")
	}
	c := 0
	length := len(num)
	for i := 0; i < length; i++ {
		ch := num[length-1-i]
		if !unicode.IsDigit(rune(ch)) {
			return 0, fmt.Errorf("non-digit character: %c", ch)
		}
		digit := int(ch - '0')
		c = d[c][p[(i+1)%8][digit]]
	}
	return inv[c], nil
}

// ValidateVerhoeff validates a string of digits where the last digit is the Verhoeff check digit.
func ValidateVerhoeff(num string) bool {
	if len(num) < 2 {
		return false
	}
	for _, ch := range num {
		if !unicode.IsDigit(ch) {
			return false
		}
	}
	c := 0
	length := len(num)
	for i := 0; i < length; i++ {
		digit := int(num[length-1-i] - '0')
		c = d[c][p[i%8][digit]]
	}
	return c == 0
}
