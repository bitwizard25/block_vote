package crypto

// DeriveCommitment derives an identity commitment from the voter's secret and system salt.
func DeriveCommitment(secret, salt string) string {
	return SHA3String(secret + ":" + salt)
}

// DeriveNullifier derives a deterministic nullifier hash for an election to prevent double voting.
func DeriveNullifier(secret, electionID string) string {
	return SHA3String(secret + "@" + electionID)
}
