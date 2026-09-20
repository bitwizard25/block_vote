package crypto

import (
	"encoding/hex"

	"golang.org/x/crypto/sha3"
)

// SHA3String computes the SHA3-256 hash of a string and returns a hex string.
func SHA3String(data string) string {
	h := sha3.New256()
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}

// SHA3Bytes computes the SHA3-256 hash of raw byte slice.
func SHA3Bytes(data []byte) []byte {
	h := sha3.New256()
	h.Write(data)
	return h.Sum(nil)
}
