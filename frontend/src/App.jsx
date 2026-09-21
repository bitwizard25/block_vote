import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sidebar, TopBar } from './components/Header';
import LandingView from './components/LandingView';
import { wsUrl } from './apiConfig';
import DashboardView from './components/DashboardView';
import RegisterView from './components/RegisterView';
import VotingView from './components/VotingView';
import ExplorerView from './components/ExplorerView';
import AuditView from './components/AuditView';
import AttackSandboxView from './components/AttackSandboxView';

import { fetchElections, updateTalliesFromBlock } from './store/slices/electionsSlice';
import {
  fetchBlocks,
  fetchMempool,
  fetchNodeStatus,
  addTelemetryLog,
  onWsVoteCast,
  onWsBlockMined
} from './store/slices/blockchainSlice';

export default function App() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('home');
  const [wsConnected, setWsConnected] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    dispatch(fetchElections());
    dispatch(fetchBlocks());
    dispatch(fetchMempool());
    dispatch(fetchNodeStatus());
  }, [dispatch]);

  // WebSocket Live Cryptographic Hub
  useEffect(() => {
    // Same-origin (dev proxy or the Go binary serving both) unless
    // VITE_API_BASE_URL points this build at a separately-deployed backend.
    const url = wsUrl();

    let ws;
    let reconnectTimer;

    const connect = () => {
      try {
        ws = new WebSocket(url);

        ws.onopen = () => {
          setWsConnected(true);
          dispatch(addTelemetryLog({ tag: 'WEBSOCKET', msg: 'Connected to Go consensus telemetry hub' }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case 'vote_cast':
                dispatch(onWsVoteCast(data.payload));
                dispatch(addTelemetryLog({
                  tag: 'MEMPOOL',
                  msg: `New ballot staged: Nullifier ${data.payload.nullifier ? data.payload.nullifier.substring(0, 14) : '???'}...`
                }));
                break;

              case 'block_mined':
                dispatch(onWsBlockMined(data.payload));
                dispatch(updateTalliesFromBlock(data.payload));
                dispatch(fetchNodeStatus());
                dispatch(addTelemetryLog({
                  tag: 'POW-SEAL',
                  msg: `Block #${data.payload.index} mined with nonce ${data.payload.nonce}. Hash: ${data.payload.hash.substring(0, 14)}...`
                }));
                break;

              case 'tamper_simulated':
                dispatch(fetchNodeStatus());
                dispatch(addTelemetryLog({
                  tag: 'ALERT',
                  msg: 'Tamper injection detected on Node-Alpha ledger!'
                }));
                break;

              case 'node_healed':
                dispatch(fetchNodeStatus());
                dispatch(addTelemetryLog({
                  tag: 'CONSENSUS',
                  msg: 'Node-Alpha healed & synchronized from majority peer mesh.'
                }));
                break;

              default:
                break;
            }
          } catch (e) {
            console.error('WS Parse Error', e);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        console.warn('WS Connect Error', err);
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [dispatch]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (activeTab === 'home') {
    return <LandingView onEnter={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="platform-layout">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="platform-main">
        <TopBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="platform-content">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'register' && <RegisterView setActiveTab={setActiveTab} />}
          {activeTab === 'voting' && <VotingView setActiveTab={setActiveTab} />}
          {activeTab === 'explorer' && <ExplorerView setActiveTab={setActiveTab} />}
          {activeTab === 'audit' && <AuditView setActiveTab={setActiveTab} />}
          {activeTab === 'attacks' && <AttackSandboxView setActiveTab={setActiveTab} />}
        </main>

        <footer style={{
          borderTop: '1px solid var(--material-border)',
          padding: '20px 32px',
          fontSize: '0.8rem',
          color: 'var(--text-tertiary)',
          background: 'rgba(10, 10, 14, 0.7)',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              BlockVote Bharat — National Digital Election Platform (Figma High-Assurance Architecture)
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>SHA3-256 Merkle Proofs</span>
              <span>•</span>
              <span>Verhoeff Checksum $D_5$</span>
              <span>•</span>
              <span>3-Node Byzantine Mesh Consensus</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
