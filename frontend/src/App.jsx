import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/Header';
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
  const [activeTab, setActiveTab] = useState('dashboard');
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
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // When running with Vite dev proxy, /ws is proxied to :8080/ws
    const wsUrl = `${protocol}//${host}/ws`;

    let ws;
    let reconnectTimer;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="app-container" style={{ flex: 1 }}>
        {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
        {activeTab === 'register' && <RegisterView setActiveTab={setActiveTab} />}
        {activeTab === 'voting' && <VotingView setActiveTab={setActiveTab} />}
        {activeTab === 'explorer' && <ExplorerView setActiveTab={setActiveTab} />}
        {activeTab === 'audit' && <AuditView setActiveTab={setActiveTab} />}
        {activeTab === 'attacks' && <AttackSandboxView setActiveTab={setActiveTab} />}
      </main>

      <footer style={{
        borderTop: '1px solid var(--material-border)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: 'var(--text-tertiary)',
        background: 'rgba(10, 10, 14, 0.6)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            BlockVote.Go — High-Assurance Blockchain Voting System (Apple HIG Specification)
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>SHA3-256 Merkle Proofs</span>
            <span>•</span>
            <span>Verhoeff Checksum</span>
            <span>•</span>
            <span>Byzantine Mesh Consensus</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
