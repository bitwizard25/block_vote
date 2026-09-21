let ws;
let networkViz;
let currentElection = null;
let currentCandidates = [];
let selectedCandidateId = null;
let userVoterSecret = '';

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initWebSocket();
  networkViz = new NetworkVisualizer('networkCanvas');
  loadElections();
  loadStats();
  loadBlocks();
  setupForms();
});

// Tab Navigation
function initTabs() {
  const tabs = document.querySelectorAll('.nav-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-view');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      if (targetId === 'explorerView') loadBlocks();
      if (targetId === 'dashboardView') loadStats();
      if (targetId === 'attacksView') checkNodeStatus();
    });
  });
}

// WebSocket Connection
function initWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    logTerminal('SYS', 'Connected to real-time blockchain telemetry stream.');
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      handleWsEvent(msg);
    } catch (e) {
      console.error(e);
    }
  };

  ws.onclose = () => {
    logTerminal('WARN', 'Telemetry socket disconnected. Reconnecting in 3s...');
    setTimeout(initWebSocket, 3000);
  };
}

function handleWsEvent(msg) {
  if (msg.type === 'VOTE_CAST') {
    logTerminal('MEMPOOL', `Anonymous vote broadcast to unconfirmed transaction pool: ${msg.data.tx_hash.substring(0, 16)}...`);
    networkViz.emitPacket(3, 0, '#00f0ff');
    loadStats();
  } else if (msg.type === 'BLOCK_MINED') {
    logTerminal('CONSENSUS', `🎉 Block #${msg.data.index} MINED with PoW hash: ${msg.data.hash.substring(0, 16)}... (Nonce: ${msg.data.nonce})`);
    networkViz.emitPacket(0, 1, '#10b981');
    networkViz.emitPacket(0, 2, '#8b5cf6');
    loadStats();
    loadBlocks();
    loadElections();
  } else if (msg.type === 'TAMPER_ALERT') {
    logTerminal('CRITICAL', `🚨 BYZANTINE FAULT DETECTED: ${msg.data.node_id} state modified! Merkle integrity broken.`);
  } else if (msg.type === 'NODE_HEALED') {
    logTerminal('SECURITY', `🛡️ SELF-HEALING COMPLETE: ${msg.data.node_id} restored from honest consensus peers.`);
    checkNodeStatus();
  }
}

function logTerminal(tag, message) {
  const terminal = document.getElementById('terminalLogs');
  if (!terminal) return;
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.innerHTML = `<span class="log-time">[${time}]</span><span class="log-tag">[${tag}]</span> ${message}`;
  terminal.appendChild(entry);
  terminal.scrollTop = terminal.scrollHeight;
}

// Load Election Candidates
async function loadElections() {
  try {
    const res = await fetch('/api/elections');
    const elections = await res.json();
    if (elections && elections.length > 0) {
      currentElection = elections[0];
      currentCandidates = currentElection.candidates;
      renderCandidates(currentCandidates);
    }
  } catch (err) {
    console.error('Failed to load elections:', err);
  }
}

function renderCandidates(candidates) {
  const grid = document.getElementById('candidateGrid');
  if (!grid) return;
  grid.innerHTML = '';

  candidates.forEach(c => {
    const card = document.createElement('div');
    card.className = `candidate-card ${selectedCandidateId === c.id ? 'selected' : ''}`;
    card.onclick = () => {
      selectedCandidateId = c.id;
      renderCandidates(candidates);
      const selInput = document.getElementById('selectedCandidateDisplay');
      if (selInput) selInput.value = `#${c.id} - ${c.name}`;
    };

    const imgSrc = c.image_url || '/static/img/amit_sir.jpeg';

    card.innerHTML = `
      <div class="candidate-img-wrap">
        <img src="${imgSrc}" alt="${c.name}">
      </div>
      <div class="candidate-name">${c.name}</div>
      <div class="candidate-title">${c.title}</div>
      <div class="candidate-bio">${c.bio}</div>
      <div class="vote-badge">VERIFIED VOTES: ${c.vote_count}</div>
    `;
    grid.appendChild(card);
  });
}

// Load Dashboard Stats
async function loadStats() {
  try {
    const [blocksRes, mempoolRes] = await Promise.all([
      fetch('/api/blocks'),
      fetch('/api/mempool')
    ]);
    const blocks = await blocksRes.json();
    const mempool = await mempoolRes.json();

    const blockHeightEl = document.getElementById('statBlockHeight');
    if (blockHeightEl) blockHeightEl.innerText = blocks.length;

    const mempoolEl = document.getElementById('statMempool');
    if (mempoolEl) mempoolEl.innerText = mempool.length;

    let totalVotes = 0;
    blocks.forEach(b => {
      if (b.transactions) totalVotes += b.transactions.length;
    });
    const totalVotesEl = document.getElementById('statTotalVotes');
    if (totalVotesEl) totalVotesEl.innerText = totalVotes;
  } catch (err) {
    console.error('Stats loading error:', err);
  }
}

// Load Blockchain Timeline
async function loadBlocks() {
  try {
    const res = await fetch('/api/blocks');
    const blocks = await res.json();
    const container = document.getElementById('blockchainTimeline');
    if (!container) return;
    container.innerHTML = '';

    blocks.slice().reverse().forEach(b => {
      const txCount = b.transactions ? b.transactions.length : 0;
      const card = document.createElement('div');
      card.className = 'glass-panel';
      card.style.marginBottom = '16px';
      card.innerHTML = `
        <div class="panel-header">
          <div class="panel-title">
            <span style="color:var(--accent-cyan);">BLOCK #${b.index}</span>
            <span style="font-size:0.8rem; color:var(--text-muted); font-weight:normal;">Nonce: ${b.nonce}</span>
          </div>
          <span class="network-badge">${txCount} Transactions</span>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; font-family:var(--font-mono); font-size:0.85rem;">
          <div><strong style="color:var(--text-muted);">PREV HASH:</strong> ${b.prev_hash.substring(0, 20)}...</div>
          <div><strong style="color:var(--text-muted);">BLOCK HASH:</strong> <span style="color:var(--accent-emerald);">${b.hash.substring(0, 20)}...</span></div>
          <div><strong style="color:var(--text-muted);">MERKLE ROOT:</strong> <span style="color:var(--accent-cyan);">${b.merkle_root.substring(0, 20)}...</span></div>
          <div><strong style="color:var(--text-muted);">DIFFICULTY:</strong> ${b.difficulty} leading zeros</div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading blocks:', err);
  }
}

// Form Handlers
function setupForms() {
  // Registration Form (Aadhaar + EPIC)
  const regForm = document.getElementById('registrationForm');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const aadhaar = document.getElementById('aadhaarInput').value.trim();
      const epic = document.getElementById('epicInput').value.trim();

      const alertBox = document.getElementById('regAlert');
      alertBox.style.display = 'none';

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aadhaar, epic })
        });
        const data = await res.json();
        if (!res.ok) {
          alertBox.className = 'alert alert-danger';
          alertBox.innerText = data;
          alertBox.style.display = 'block';
          return;
        }

        // Open Simulated Aadhaar OTP Modal
        document.getElementById('otpModalAadhaar').value = data.aadhaar;
        document.getElementById('otpModalEPIC').value = data.epic;
        document.getElementById('otpInput').value = data.demo_otp; // autofill demo for convenience
        document.getElementById('otpModal').classList.add('active');
      } catch (err) {
        console.error(err);
      }
    });
  }

  // OTP Verification Form
  const otpForm = document.getElementById('otpForm');
  if (otpForm) {
    otpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const aadhaar = document.getElementById('otpModalAadhaar').value;
      const epic = document.getElementById('otpModalEPIC').value;
      const otp = document.getElementById('otpInput').value;

      try {
        const res = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aadhaar, epic, otp })
        });
        const data = await res.json();
        if (!res.ok) {
          alert('OTP Verification Failed: ' + data);
          return;
        }

        document.getElementById('otpModal').classList.remove('active');

        // Display Generated Voter Passport Card
        userVoterSecret = data.voter_secret;
        document.getElementById('passportCard').style.display = 'block';
        document.getElementById('passportSeed').innerText = data.mnemonic;
        document.getElementById('passportSecret').innerText = data.voter_secret;

        // Auto-fill into voting booth
        const voteKeyInput = document.getElementById('voterSecretInput');
        if (voteKeyInput) voteKeyInput.value = data.voter_secret;

        logTerminal('KYC', `Voter verified via Aadhaar OTP! 12-word cryptographic seed generated locally.`);
      } catch (err) {
        console.error(err);
      }
    });
  }

  // Voting Booth Form
  const voteForm = document.getElementById('voteForm');
  if (voteForm) {
    voteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!selectedCandidateId) {
        alert('Please click on an eligible candidate above to cast your ballot.');
        return;
      }
      const voterSecret = document.getElementById('voterSecretInput').value.trim();
      if (!voterSecret) {
        alert('Please enter or paste your Secret Voter Key.');
        return;
      }

      const voteStatusEl = document.getElementById('voteStatus');
      voteStatusEl.style.display = 'none';

      try {
        const res = await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            election_id: currentElection.id,
            candidate_id: selectedCandidateId,
            voter_secret: voterSecret
          })
        });
        const data = await res.json();
        if (!res.ok) {
          voteStatusEl.style.display = 'block';
          voteStatusEl.style.color = 'var(--accent-red)';
          voteStatusEl.innerText = '❌ VOTE REJECTED: ' + data;
          return;
        }

        voteStatusEl.style.display = 'block';
        voteStatusEl.style.color = 'var(--accent-emerald)';
        voteStatusEl.innerHTML = `
          ✅ <strong>BALLOT SEALED ANONYMOUSLY IN MEMPOOL!</strong><br>
          Your Cryptographic Receipt Hash: <span style="font-family:var(--font-mono);">${data.receipt_hash}</span><br>
          <small>Keep this receipt hash to verify inclusion in the block audit tree.</small>
        `;

        // Auto-fill audit input for convenience
        const auditInput = document.getElementById('receiptHashInput');
        if (auditInput) auditInput.value = data.receipt_hash;
      } catch (err) {
        console.error(err);
      }
    });
  }

  // Auditor Merkle Form
  const auditForm = document.getElementById('auditForm');
  if (auditForm) {
    auditForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const receiptHash = document.getElementById('receiptHashInput').value.trim();
      const statusEl = document.getElementById('auditStatus');
      statusEl.style.display = 'none';

      try {
        const res = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receipt_hash: receiptHash })
        });
        const data = await res.json();
        if (!res.ok) {
          statusEl.style.display = 'block';
          statusEl.style.color = 'var(--accent-red)';
          statusEl.innerText = '❌ RECEIPT NOT FOUND in mined blockchain blocks.';
          MerkleVisualizer.renderTree('merkleTreeContainer', 'INVALID', [], receiptHash);
          return;
        }

        statusEl.style.display = 'block';
        statusEl.style.color = 'var(--accent-emerald)';
        statusEl.innerHTML = `
          🎉 <strong>CRYPTOGRAPHIC INCLUSION VERIFIED!</strong><br>
          Your secret ballot sits inside <strong>Block #${data.block_index}</strong> (Merkle Root: <span style="font-family:var(--font-mono);">${data.merkle_root.substring(0, 16)}...</span>).
        `;

        // Render Merkle Proof Tree with green path!
        MerkleVisualizer.renderTree('merkleTreeContainer', data.merkle_root, data.proof, receiptHash);
      } catch (err) {
        console.error(err);
      }
    });
  }
}

// Mining Trigger
async function triggerMine() {
  const btn = document.getElementById('mineBtn');
  btn.disabled = true;
  btn.innerText = '⛏️ MINING POW HASH (Leading Zeros)...';

  try {
    const res = await fetch('/api/mine', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      alert('Mining error: ' + data);
    }
  } catch (err) {
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.innerText = '⛏️ SEAL PENDING TRANSACTIONS INTO BLOCK';
  }
}

// Attack & Self-Healing Sandbox
async function simulateTamper() {
  try {
    const res = await fetch('/api/simulate-tamper', { method: 'POST' });
    const data = await res.json();
    alert(data.message || data);
    checkNodeStatus();
  } catch (err) {
    console.error(err);
  }
}

async function healNode() {
  try {
    const res = await fetch('/api/heal-node', { method: 'POST' });
    const data = await res.json();
    alert(data.message || data);
    checkNodeStatus();
  } catch (err) {
    console.error(err);
  }
}

async function checkNodeStatus() {
  try {
    const res = await fetch('/api/node-status');
    const nodes = await res.json();
    const container = document.getElementById('nodeStatusList');
    if (!container) return;
    container.innerHTML = '';

    for (const [id, s] of Object.entries(nodes)) {
      const isCorrupted = s.tampered || !s.is_valid;
      const badgeClass = isCorrupted ? 'btn-danger' : 'network-badge';
      const statusText = isCorrupted ? '🚨 CORRUPTED / TAMPERED' : '✅ HONEST & VALID';

      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.style.padding = '12px 16px';
      item.style.background = 'rgba(0,0,0,0.4)';
      item.style.borderRadius = '8px';
      item.style.marginBottom = '8px';
      item.innerHTML = `
        <div>
          <strong>${id}</strong>
          <span style="color:var(--text-muted); font-size:0.8rem; margin-left:8px;">Height: ${s.block_height}</span>
        </div>
        <span class="${badgeClass}" style="padding:4px 12px; font-size:0.8rem;">${statusText}</span>
      `;
      container.appendChild(item);
    }
  } catch (err) {
    console.error(err);
  }
}
