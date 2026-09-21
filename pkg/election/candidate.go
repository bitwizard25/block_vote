package election

// Candidate represents a person or choice running in an election.
type Candidate struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Title     string `json:"title"`
	Bio       string `json:"bio"`
	ImageURL  string `json:"image_url"`
	VoteCount int    `json:"vote_count"`
}
