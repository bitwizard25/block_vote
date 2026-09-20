package main

import (
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"

	"blockvote/pkg/api"
	"blockvote/pkg/blockchain"
	"blockvote/pkg/consensus"
	"blockvote/pkg/election"
	"blockvote/pkg/identity"
	"blockvote/web"
)

func main() {
	port := flag.String("port", "8080", "Port to serve application on")
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
	if err := http.ListenAndServe(":"+*port, mux); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
