package main

import (
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"

	"blockvote/pkg/api"
	"blockvote/pkg/blockchain"
	"blockvote/pkg/consensus"
	"blockvote/pkg/election"
	"blockvote/pkg/identity"
	"blockvote/web"
)

func main() {
	defaultPort := "8080"
	// Railway, Render, Fly.io, Heroku, etc. all assign the listen port via
	// $PORT and expect the app to bind to it, rather than a fixed port.
	if envPort := os.Getenv("PORT"); envPort != "" {
		defaultPort = envPort
	}
	port := flag.String("port", defaultPort, "Port to serve application on")
	difficulty := flag.Int("difficulty", 2, "PoW mining difficulty (leading zeros)")
	flag.Parse()

	fmt.Println("==========================================================")
	fmt.Println("  ⚡ BLOCKVOTE.GO — GOD-TIER BLOCKCHAIN VOTING PLATFORM ⚡  ")
	fmt.Println("==========================================================")
	fmt.Printf("  • PoW Difficulty: %d leading zeros\n", *difficulty)
	fmt.Printf("  • Consensus: 3-Node Mesh (Alpha, Beta, Gamma)\n")
	fmt.Printf("  • Privacy: Zero-Knowledge Nullifiers & Merkle Proofs\n")
	fmt.Println("==========================================================")

	voterRoll := identity.NewVoterRoll("blockvote-master-salt-2026")
	chain := blockchain.NewBlockchain(*difficulty)
	mempool := blockchain.NewMempool()
	mesh := consensus.NewNetworkMesh([]string{"Node-Alpha", "Node-Beta", "Node-Gamma"}, *difficulty)
	elMgr := election.NewElectionManager()
	hub := api.NewHub()

	// Seed default general election
	candidates := []election.Candidate{
		{
			ID:       1,
			Name:     "Rajeshwar Sharma",
			Title:    "Rashtriya Pragati Dal (National Progress Party)",
			Bio:      "Election Symbol: Scales of Justice (Tarazu). Focused on public infrastructure, transparent governance, and farmers welfare.",
			ImageURL: "/static/img/candidate_1.jpg",
		},
		{
			ID:       2,
			Name:     "Dr. Sunita Deshmukh",
			Title:    "Lok Seva Manch (Citizens Welfare Front)",
			Bio:      "Election Symbol: Golden Wheat Sheaf (Baali). Dedicated to universal healthcare, women empowerment, and rural education.",
			ImageURL: "/static/img/candidate_2.jpg",
		},
		{
			ID:       3,
			Name:     "Priya Nambiar",
			Title:    "Yuva Vikas Samiti (Youth & Tech Initiative)",
			Bio:      "Election Symbol: Rising Lamp (Deepak). Championing clean green energy, youth employment, and digital democracy.",
			ImageURL: "/static/img/candidate_3.jpg",
		},
	}
	_, _ = elMgr.CreateElection("elect_2026_gen", "Lok Sabha General Election 2026 (लोकसभा आम चुनाव)", "Decentralized, Aadhaar-verified, privacy-preserving blockchain vote", candidates)

	appState := &api.AppState{
		VoterRoll:       voterRoll,
		Chain:           chain,
		Mempool:         mempool,
		Mesh:            mesh,
		ElectionManager: elMgr,
		Hub:             hub,
	}

	// Auto-miner daemon: automatically seals when mempool reaches 5 votes
	worker := blockchain.NewMinerWorker(chain, mempool, 5)
	worker.OnBlockMined = func(b blockchain.Block) {
		_ = mesh.BroadcastBlock(b)
		hub.Broadcast("BLOCK_MINED", b)
	}
	worker.Start()
	defer worker.Stop()

	router := api.SetupRouter(appState)

	// Mount router on top of static file server
	mux := http.NewServeMux()

	// Static assets
	staticFS, err := fs.Sub(web.Files, "static")
	if err != nil {
		log.Fatalf("Failed to initialize static filesystem: %v", err)
	}
	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.FS(staticFS))))

	// Templates / Root
	templatesFS, err := fs.Sub(web.Files, "templates")
	if err != nil {
		log.Fatalf("Failed to initialize templates filesystem: %v", err)
	}
	mux.Handle("/", http.FileServer(http.FS(templatesFS)))

	// API and WebSocket routing
	mux.Handle("/api/", router)
	mux.Handle("/ws", router)

	log.Printf("🚀 BlockVote Node online at http://localhost:%s", *port)
	if err := http.ListenAndServe(":"+*port, withCORS(mux)); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}

// withCORS lets the frontend call this API from a different origin, which is
// the case whenever the frontend (e.g. on Vercel) and this backend (e.g. on
// Railway/Render/Fly) are deployed as two separate services rather than one
// binary serving both. No cookies or credentialed requests are used anywhere
// in this app, so a permissive default is safe; set ALLOWED_ORIGIN to lock
// it down to one exact origin in production.
func withCORS(next http.Handler) http.Handler {
	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "*"
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
