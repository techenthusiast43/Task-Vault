import React, { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain, useBalance, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import {
  ShieldCheck,
  PlusCircle,
  Clock,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Send,
  Scale,
  RefreshCw,
  Wallet,
  UserCheck,
  X,
  Copy,
  Check
} from 'lucide-react';
import { TASK_VAULT_ADDRESS } from './contracts/deployedAddress.js';
import { bohrTestnet } from './config/wagmi.js';

// Status labels & badges
const STATUS_CONFIG = {
  0: { label: 'Created / Funded', class: 'status-created', text: 'Waiting for Freelancer' },
  1: { label: 'In Progress', class: 'status-inprogress', text: 'Work Underway' },
  2: { label: 'Submitted', class: 'status-submitted', text: 'Client Review Active' },
  3: { label: 'Completed', class: 'status-completed', text: 'Funds Released' },
  4: { label: 'Disputed', class: 'status-disputed', text: 'Arbiter Review Required' },
  5: { label: 'Resolved', class: 'status-resolved', text: 'Settled' },
  6: { label: 'Cancelled', class: 'status-cancelled', text: 'Refunded to Client' },
};

// Initial realistic seed tasks for demonstration and quick testing
const INITIAL_TASKS = [
  {
    id: 1,
    client: '0x1A2b3c4D5E6F7890123456789ABCDEF012345678',
    freelancer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    escrowBalance: '0.2',
    initialAmount: '0.2',
    deadline: Math.floor(Date.now() / 1000) + 86400 * 5,
    reviewPeriod: 86400 * 3,
    submittedAt: 0,
    status: 1, // In Progress
    title: 'Landing Page for BOT DEX',
    description: 'Build a responsive Web3 landing page with high-converting CTAs and live BOT token stats.',
    deliverableUri: '',
    proposal: { active: false },
  },
  {
    id: 2,
    client: '0x3567b1234567890123456789ABCDEF0123456789',
    freelancer: '0x1A2b3c4D5E6F7890123456789ABCDEF012345678',
    escrowBalance: '0.5',
    initialAmount: '0.5',
    deadline: Math.floor(Date.now() / 1000) - 3600,
    reviewPeriod: 86400 * 3,
    submittedAt: Math.floor(Date.now() / 1000) - 86400,
    status: 2, // Submitted
    title: 'Smart Contract Audit & Formal Verification',
    description: 'Audit Bohr ERC-20 staking vaults for reentrancy vulnerabilities and gas optimizations.',
    deliverableUri: 'https://scan.bohr.life/audit-report-v1.pdf',
    proposal: { active: false },
  },
  {
    id: 3,
    client: '0x89A3c6045E7b4c2b9f7a77e53fA71fF23447B912',
    freelancer: '0x5555e6F7890123456789ABCDEF01234567890123',
    escrowBalance: '1.2',
    initialAmount: '1.2',
    deadline: Math.floor(Date.now() / 1000) + 86400 * 2,
    reviewPeriod: 86400 * 3,
    submittedAt: 0,
    status: 4, // Disputed
    title: 'DeFi Liquidity Dashboard & API Indexer',
    description: 'Custom Subgraph indexing for Bohr Network liquidity pools and trade volume tracking.',
    deliverableUri: 'https://github.com/bohr-defi/indexer-v1',
    proposal: { active: false },
  },
];

export default function App() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();

  const { data: balanceData } = useBalance({
    address,
    chainId: bohrTestnet.id,
  });

  // State
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('taskvault_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [activeTab, setActiveTab] = useState('all'); // all, client, freelancer, disputed
  const [roleEmulation, setRoleEmulation] = useState('auto'); // auto, client, freelancer, arbiter
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isProposeOpen, setIsProposeOpen] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [isArbitrateOpen, setIsArbitrateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    freelancer: '',
    amount: '0.2',
    deadlineDays: 7,
    reviewPeriodDays: 3,
  });

  const [deliverableUri, setDeliverableUri] = useState('');
  const [settlementForm, setSettlementForm] = useState({
    freelancerAmount: '',
    clientAmount: '',
    durationDays: 3,
  });
  const [disputeReason, setDisputeReason] = useState('');
  const [arbitrateForm, setArbitrateForm] = useState({
    freelancerAmount: '',
    clientAmount: '',
  });

  // Activity / Transaction Feed
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('taskvault_txs');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'tx-1',
            type: 'deposit',
            desc: 'Created task "Landing Page for BOT DEX" with 0.2 BOT escrow locked',
            txHash: '0x9a8f273b5c6e810a3d4f526189bce910328475cfa1034e457f92',
            timestamp: Date.now() - 3600000 * 12,
          },
          {
            id: 'tx-2',
            type: 'submission',
            desc: 'Deliverable submitted for "Smart Contract Audit"',
            txHash: '0x4f128bcda4923e10fa5820938bce1928471928374a581938b472',
            timestamp: Date.now() - 3600000 * 3,
          },
        ];
  });

  // Persist tasks & txs
  useEffect(() => {
    localStorage.setItem('taskvault_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskvault_txs', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (type, desc, txHash = '') => {
    const fakeHash = txHash || '0x' + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        type,
        desc,
        txHash: fakeHash,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  const isBohrChain = chainId === bohrTestnet.id;

  // Role detection
  const currentAddress = address || '0x1A2b3c4D5E6F7890123456789ABCDEF012345678';
  const arbiterAddress = '0x89A3c6045E7b4c2b9f7a77e53fA71fF23447B912';

  const isClientOf = (task) =>
    roleEmulation === 'client' ||
    (roleEmulation === 'auto' && task.client.toLowerCase() === currentAddress.toLowerCase());

  const isFreelancerOf = (task) =>
    roleEmulation === 'freelancer' ||
    (roleEmulation === 'auto' && task.freelancer.toLowerCase() === currentAddress.toLowerCase());

  const isArbiter = roleEmulation === 'arbiter' || currentAddress.toLowerCase() === arbiterAddress.toLowerCase();

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'client') return isClientOf(t);
    if (activeTab === 'freelancer') return isFreelancerOf(t);
    if (activeTab === 'disputed') return t.status === 4;
    return true;
  });

  // Format short address
  const shortAddr = (addr) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '');

  // Copy address helper
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Actions
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!createForm.freelancer || !createForm.amount || !createForm.title) {
      alert('Please fill in all required fields');
      return;
    }

    const newTask = {
      id: tasks.length + 1,
      client: currentAddress,
      freelancer: createForm.freelancer,
      escrowBalance: createForm.amount,
      initialAmount: createForm.amount,
      deadline: Math.floor(Date.now() / 1000) + Number(createForm.deadlineDays) * 86400,
      reviewPeriod: Number(createForm.reviewPeriodDays) * 86400,
      submittedAt: 0,
      status: 0, // Created
      title: createForm.title,
      description: createForm.description,
      deliverableUri: '',
      proposal: { active: false },
    };

    setTasks([newTask, ...tasks]);
    addTransaction('deposit', `Created task "${newTask.title}" with ${newTask.escrowBalance} BOT locked in escrow`);
    setIsCreateOpen(false);
    setCreateForm({
      title: '',
      description: '',
      freelancer: '',
      amount: '0.2',
      deadlineDays: 7,
      reviewPeriodDays: 3,
    });
  };

  const handleAcceptTask = (task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: 1 } : t)));
    addTransaction('action', `Freelancer accepted task #${task.id}: "${task.title}"`);
  };

  const handleSubmitWork = (e) => {
    e.preventDefault();
    if (!deliverableUri) return;
    setTasks(
      tasks.map((t) =>
        t.id === selectedTask.id
          ? {
              ...t,
              status: 2,
              deliverableUri,
              submittedAt: Math.floor(Date.now() / 1000),
              proposal: { active: false },
            }
          : t
      )
    );
    addTransaction('submission', `Deliverable submitted for task #${selectedTask.id}: ${deliverableUri}`);
    setIsSubmitOpen(false);
    setDeliverableUri('');
  };

  const handleApproveWork = (task) => {
    if (!confirm(`Approve deliverable and release ${task.escrowBalance} BOT to freelancer?`)) return;
    setTasks(
      tasks.map((t) =>
        t.id === task.id
          ? { ...t, status: 3, escrowBalance: '0', proposal: { active: false } }
          : t
      )
    );
    addTransaction('release', `Client approved task #${task.id}. ${task.escrowBalance} BOT released to ${shortAddr(task.freelancer)}`);
  };

  const handleTimeoutPayout = (task) => {
    setTasks(
      tasks.map((t) =>
        t.id === task.id
          ? { ...t, status: 3, escrowBalance: '0', proposal: { active: false } }
          : t
      )
    );
    addTransaction('release', `Freelancer claimed timeout auto-release for task #${task.id}: ${task.escrowBalance} BOT released`);
  };

  const handleClientCancel = (task) => {
    if (!confirm(`Cancel task #${task.id} and refund full deposit (${task.escrowBalance} BOT)?`)) return;
    setTasks(
      tasks.map((t) =>
        t.id === task.id
          ? { ...t, status: 6, escrowBalance: '0', proposal: { active: false } }
          : t
      )
    );
    addTransaction('refund', `Client cancelled task #${task.id}. ${task.escrowBalance} BOT refunded to client`);
  };

  const handleProposeSettlement = (e) => {
    e.preventDefault();
    const fAmt = parseFloat(settlementForm.freelancerAmount) || 0;
    const cAmt = parseFloat(settlementForm.clientAmount) || 0;
    const total = parseFloat(selectedTask.escrowBalance);

    if (Math.abs(fAmt + cAmt - total) > 0.0001) {
      alert(`The split sum (${(fAmt + cAmt).toFixed(4)} BOT) must equal the escrow balance (${total} BOT).`);
      return;
    }

    setTasks(
      tasks.map((t) =>
        t.id === selectedTask.id
          ? {
              ...t,
              proposal: {
                proposedBy: currentAddress,
                freelancerAmount: settlementForm.freelancerAmount,
                clientAmount: settlementForm.clientAmount,
                expiresAt: Math.floor(Date.now() / 1000) + Number(settlementForm.durationDays) * 86400,
                active: true,
              },
            }
          : t
      )
    );
    addTransaction(
      'proposal',
      `Settlement proposed on task #${selectedTask.id}: ${settlementForm.freelancerAmount} BOT to Freelancer, ${settlementForm.clientAmount} BOT to Client`
    );
    setIsProposeOpen(false);
  };

  const handleAcceptSettlement = (task) => {
    const prop = task.proposal;
    if (!confirm(`Accept mutual settlement? Freelancer receives ${prop.freelancerAmount} BOT, Client receives ${prop.clientAmount} BOT.`)) return;

    setTasks(
      tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: 5,
              escrowBalance: '0',
              proposal: { ...t.proposal, active: false },
            }
          : t
      )
    );
    addTransaction(
      'release',
      `Mutual settlement executed for task #${task.id}: ${prop.freelancerAmount} BOT paid, ${prop.clientAmount} BOT refunded`
    );
  };

  const handleRaiseDispute = (e) => {
    e.preventDefault();
    setTasks(
      tasks.map((t) =>
        t.id === selectedTask.id
          ? { ...t, status: 4, proposal: { active: false } }
          : t
      )
    );
    addTransaction('dispute', `Dispute raised on task #${selectedTask.id}: "${disputeReason}"`);
    setIsDisputeOpen(false);
    setDisputeReason('');
  };

  const handleResolveDispute = (e) => {
    e.preventDefault();
    const fAmt = parseFloat(arbitrateForm.freelancerAmount) || 0;
    const cAmt = parseFloat(arbitrateForm.clientAmount) || 0;
    const total = parseFloat(selectedTask.escrowBalance);

    if (Math.abs(fAmt + cAmt - total) > 0.0001) {
      alert(`The split sum (${(fAmt + cAmt).toFixed(4)} BOT) must strictly equal the escrow balance (${total} BOT).`);
      return;
    }

    setTasks(
      tasks.map((t) =>
        t.id === selectedTask.id
          ? { ...t, status: 5, escrowBalance: '0', proposal: { active: false } }
          : t
      )
    );
    addTransaction(
      'release',
      `Arbiter resolved dispute for task #${selectedTask.id}: Awarded ${arbitrateForm.freelancerAmount} BOT to Freelancer, ${arbitrateForm.clientAmount} BOT to Client`
    );
    setIsArbitrateOpen(false);
  };

  return (
    <div>
      {/* App Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand-wrapper">
            <div className="brand-icon">
              <ShieldCheck size={26} color="#ffffff" />
            </div>
            <div>
              <span className="brand-title">TaskVault</span>
              <span className="brand-badge" style={{ marginLeft: '0.6rem' }}>
                BOT Chain #968
              </span>
            </div>
          </div>

          <div className="header-actions">
            {/* Bohr Network Badge */}
            <div className="network-badge">
              <span className="network-pulse"></span>
              <span>Bohr Testnet</span>
            </div>

            {/* Wrong Network Warning */}
            {isConnected && !isBohrChain && (
              <button
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '0.5rem 1rem' }}
                onClick={() => switchChain({ chainId: bohrTestnet.id })}
              >
                Switch to Bohr 968
              </button>
            )}

            {/* Wallet Connect Button */}
            {isConnected ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button className="btn-secondary" onClick={() => open()}>
                  <Wallet size={16} />
                  <span>{shortAddr(address)}</span>
                  {balanceData && (
                    <span style={{ color: '#38bdf8', fontWeight: 700, marginLeft: '0.3rem' }}>
                      {parseFloat(balanceData.formatted).toFixed(2)} BOT
                    </span>
                  )}
                </button>
                <button
                  className="btn-secondary"
                  title="Disconnect"
                  style={{ padding: '0.65rem 0.8rem' }}
                  onClick={() => disconnect()}
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <button className="btn-primary" onClick={() => open()}>
                <Wallet size={18} />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Role Emulation & Sandbox Helper */}
      <div style={{ background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid var(--border-subtle)', padding: '0.6rem 1.5rem' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <UserCheck size={16} color="#818cf8" />
            <span style={{ fontWeight: 600 }}>Active Role View:</span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {['auto', 'client', 'freelancer', 'arbiter'].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleEmulation(role)}
                  style={{
                    background: roleEmulation === role ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    border: roleEmulation === role ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                    color: roleEmulation === role ? '#ffffff' : 'var(--text-secondary)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.75rem',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {role === 'auto' ? 'Auto (Connected)' : role}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Contract:</span>
            <a
              href={`https://scan.bohr.life/address/${TASK_VAULT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="party-address"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              {shortAddr(TASK_VAULT_ADDRESS)}
              <ExternalLink size={12} />
            </a>
            <button
              onClick={() => copyToClipboard(TASK_VAULT_ADDRESS)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex' }}
              title="Copy Contract Address"
            >
              {copiedAddress ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-card">
          <div className="hero-content">
            <h1>
              Trust-Minimized Escrow for <span className="hero-highlight">Freelance Jobs</span>
            </h1>
            <p>
              Clients lock BOT bounties in a smart contract. Freelancers complete the work. Payments are guaranteed
              by algorithmic escrow rules, automated ghosting timeouts, mutual settlements, and restricted arbitration.
            </p>
          </div>

          <div className="hero-stats">
            <div className="stat-box">
              <div className="stat-label">Total Escrows</div>
              <div className="stat-val highlight">{tasks.length}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Locked Value</div>
              <div className="stat-val">
                {tasks.reduce((sum, t) => sum + (parseFloat(t.escrowBalance) || 0), 0).toFixed(2)} BOT
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Native Chain</div>
              <div className="stat-val" style={{ color: '#10b981' }}>BOT 968</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <main className="main-container">
        {/* Controls Bar */}
        <div className="controls-bar">
          <div className="tabs-wrapper">
            <button
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <span>All Tasks</span>
              <span className="tab-count">{tasks.length}</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'client' ? 'active' : ''}`}
              onClick={() => setActiveTab('client')}
            >
              <span>My Tasks as Client</span>
              <span className="tab-count">{tasks.filter((t) => isClientOf(t)).length}</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'freelancer' ? 'active' : ''}`}
              onClick={() => setActiveTab('freelancer')}
            >
              <span>My Deliveries</span>
              <span className="tab-count">{tasks.filter((t) => isFreelancerOf(t)).length}</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'disputed' ? 'active' : ''}`}
              onClick={() => setActiveTab('disputed')}
            >
              <span>Disputed Escrows</span>
              <span className="tab-count">{tasks.filter((t) => t.status === 4).length}</span>
            </button>
          </div>

          <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>
            <PlusCircle size={18} />
            <span>Create New Task</span>
          </button>
        </div>

        {/* Task Cards Grid */}
        <div className="tasks-grid">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FileCheck2 size={28} />
              </div>
              <h3 className="empty-title">No Tasks Found</h3>
              <p className="empty-desc">
                There are no active escrow tasks in this view. Post a new direct-hire task or switch tabs.
              </p>
              <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>
                <PlusCircle size={18} />
                <span>Create Task</span>
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const status = STATUS_CONFIG[task.status] || STATUS_CONFIG[0];
              const clientMatch = isClientOf(task);
              const freelancerMatch = isFreelancerOf(task);

              return (
                <div key={task.id} className="task-card">
                  <div>
                    {/* Header */}
                    <div className="task-card-header">
                      <div className="task-id-badge">TASK #{task.id}</div>
                      <span className={`status-pill ${status.class}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Title & Desc */}
                    <h3 className="task-title">{task.title}</h3>
                    <p className="task-desc">{task.description}</p>

                    {/* Bounty */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div className="bounty-badge">
                        <span>{task.escrowBalance}</span>
                        <span className="bounty-token">BOT Locked</span>
                      </div>
                    </div>

                    {/* Deliverable preview if submitted */}
                    {task.deliverableUri && (
                      <div className="deliverable-banner">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                          <CheckCircle2 size={16} color="#c084fc" />
                          <a
                            href={task.deliverableUri}
                            target="_blank"
                            rel="noreferrer"
                            className="deliverable-link"
                          >
                            {task.deliverableUri}
                          </a>
                        </div>
                        <ExternalLink size={14} color="#c084fc" />
                      </div>
                    )}

                    {/* Active Settlement Proposal Banner */}
                    {task.proposal?.active && (
                      <div className="proposal-box">
                        <div className="proposal-title">
                          <Scale size={15} />
                          <span>Active Settlement Proposed</span>
                        </div>
                        <div className="proposal-splits">
                          <span>Freelancer: {task.proposal.freelancerAmount} BOT</span>
                          <span>Client: {task.proposal.clientAmount} BOT</span>
                        </div>
                      </div>
                    )}

                    {/* Parties Info */}
                    <div className="task-parties">
                      <div className="party-row">
                        <span className="party-role">Client</span>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <a
                            href={`https://scan.bohr.life/address/${task.client}`}
                            target="_blank"
                            rel="noreferrer"
                            className="party-address"
                          >
                            {shortAddr(task.client)}
                          </a>
                          {clientMatch && <span className="user-tag">You</span>}
                        </div>
                      </div>

                      <div className="party-row">
                        <span className="party-role">Freelancer</span>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <a
                            href={`https://scan.bohr.life/address/${task.freelancer}`}
                            target="_blank"
                            rel="noreferrer"
                            className="party-address"
                          >
                            {shortAddr(task.freelancer)}
                          </a>
                          {freelancerMatch && <span className="user-tag">You</span>}
                        </div>
                      </div>

                      <div className="party-row">
                        <span className="party-role">Deadline</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          {new Date(task.deadline * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contextual Action Buttons */}
                  <div className="task-actions">
                    {/* Freelancer Accept Action (State: Created) */}
                    {task.status === 0 && freelancerMatch && (
                      <button
                        className="btn-action btn-primary"
                        onClick={() => handleAcceptTask(task)}
                      >
                        <UserCheck size={15} />
                        <span>Accept Job</span>
                      </button>
                    )}

                    {/* Client Cancel Action before acceptance or missed deadline */}
                    {task.status === 0 && clientMatch && (
                      <button
                        className="btn-action btn-danger"
                        onClick={() => handleClientCancel(task)}
                      >
                        <X size={15} />
                        <span>Cancel & Refund</span>
                      </button>
                    )}

                    {/* Freelancer Submit Deliverable (State: InProgress) */}
                    {task.status === 1 && freelancerMatch && (
                      <button
                        className="btn-action btn-primary"
                        onClick={() => {
                          setSelectedTask(task);
                          setIsSubmitOpen(true);
                        }}
                      >
                        <Send size={15} />
                        <span>Submit Work</span>
                      </button>
                    )}

                    {/* Client Approve Work (State: Submitted) */}
                    {task.status === 2 && clientMatch && (
                      <button
                        className="btn-action btn-success"
                        onClick={() => handleApproveWork(task)}
                      >
                        <CheckCircle2 size={15} />
                        <span>Approve & Pay</span>
                      </button>
                    )}

                    {/* Freelancer Timeout Auto-Release (State: Submitted) */}
                    {task.status === 2 && freelancerMatch && (
                      <button
                        className="btn-action btn-secondary"
                        onClick={() => handleTimeoutPayout(task)}
                      >
                        <Clock size={15} />
                        <span>Claim Timeout Auto-Release</span>
                      </button>
                    )}

                    {/* Mutual Settlement Proposal Button (InProgress, Submitted, Disputed) */}
                    {[1, 2, 4].includes(task.status) && (clientMatch || freelancerMatch) && (
                      <button
                        className="btn-action btn-secondary"
                        onClick={() => {
                          setSelectedTask(task);
                          setSettlementForm({
                            freelancerAmount: (parseFloat(task.escrowBalance) / 2).toFixed(2),
                            clientAmount: (parseFloat(task.escrowBalance) / 2).toFixed(2),
                            durationDays: 3,
                          });
                          setIsProposeOpen(true);
                        }}
                      >
                        <Scale size={15} />
                        <span>Propose Settlement</span>
                      </button>
                    )}

                    {/* Accept Counterparty Settlement */}
                    {task.proposal?.active &&
                      [1, 2, 4].includes(task.status) &&
                      task.proposal.proposedBy.toLowerCase() !== currentAddress.toLowerCase() && (
                        <button
                          className="btn-action btn-success"
                          onClick={() => handleAcceptSettlement(task)}
                        >
                          <CheckCircle2 size={15} />
                          <span>Accept Settlement</span>
                        </button>
                      )}

                    {/* Raise Dispute Button */}
                    {[1, 2].includes(task.status) && (clientMatch || freelancerMatch) && (
                      <button
                        className="btn-action btn-danger"
                        onClick={() => {
                          setSelectedTask(task);
                          setIsDisputeOpen(true);
                        }}
                      >
                        <AlertTriangle size={15} />
                        <span>Raise Dispute</span>
                      </button>
                    )}

                    {/* Arbiter Resolve Button */}
                    {task.status === 4 && isArbiter && (
                      <button
                        className="btn-action btn-primary"
                        style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}
                        onClick={() => {
                          setSelectedTask(task);
                          setArbitrateForm({
                            freelancerAmount: (parseFloat(task.escrowBalance) / 2).toFixed(2),
                            clientAmount: (parseFloat(task.escrowBalance) / 2).toFixed(2),
                          });
                          setIsArbitrateOpen(true);
                        }}
                      >
                        <Scale size={15} />
                        <span>Arbitrate Dispute</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Activity / Blockchain Log */}
      <section className="activity-section">
        <div className="activity-card">
          <h3 className="activity-title">
            <RefreshCw size={20} color="#818cf8" />
            <span>Escrow Activity & Bohr Chain Explorer Feed</span>
          </h3>

          <div className="activity-list">
            {transactions.slice(0, 6).map((tx) => (
              <div key={tx.id} className="activity-item">
                <div className="activity-left">
                  <div
                    className="activity-icon-wrap"
                    style={{
                      background:
                        tx.type === 'deposit'
                          ? 'rgba(6, 182, 212, 0.15)'
                          : tx.type === 'release'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : tx.type === 'dispute'
                          ? 'rgba(244, 63, 94, 0.15)'
                          : 'rgba(99, 102, 241, 0.15)',
                      color:
                        tx.type === 'deposit'
                          ? '#06b6d4'
                          : tx.type === 'release'
                          ? '#10b981'
                          : tx.type === 'dispute'
                          ? '#f43f5e'
                          : '#818cf8',
                    }}
                  >
                    {tx.type === 'deposit' && <ShieldCheck size={17} />}
                    {tx.type === 'release' && <CheckCircle2 size={17} />}
                    {tx.type === 'dispute' && <AlertTriangle size={17} />}
                    {tx.type !== 'deposit' && tx.type !== 'release' && tx.type !== 'dispute' && <FileCheck2 size={17} />}
                  </div>
                  <div>
                    <div className="activity-desc">{tx.desc}</div>
                    <div className="activity-time">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>

                <a
                  href={`https://scan.bohr.life/tx/${tx.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="activity-link"
                >
                  <span>{shortAddr(tx.txHash)}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MODALS ================= */}

      {/* 1. Create Task Modal */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Escrow Task (Direct Hire)</h3>
              <button className="btn-close" onClick={() => setIsCreateOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Build Landing Page for BOT DEX"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Deliverable Requirements & Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe scope, acceptance criteria, and deliverable format..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Designated Freelancer Wallet Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="0x..."
                    value={createForm.freelancer}
                    onChange={(e) => setCreateForm({ ...createForm, freelancer: e.target.value })}
                  />
                  <span className="form-hint">
                    Direct hire: locked to this address. Funds cannot be redirected without formal cancellation.
                  </span>
                </div>

                <div className="form-group">
                  <label>Escrow Deposit Amount (BOT Token) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={createForm.amount}
                    onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                  />
                  <span className="form-hint">
                    Deposit is locked in TaskVault.sol smart contract until released or refunded.
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Work Deadline (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={createForm.deadlineDays}
                      onChange={(e) => setCreateForm({ ...createForm, deadlineDays: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Review Timeout (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={createForm.reviewPeriodDays}
                      onChange={(e) => setCreateForm({ ...createForm, reviewPeriodDays: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Lock Payment & Create Escrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Submit Work Modal */}
      {isSubmitOpen && selectedTask && (
        <div className="modal-overlay" onClick={() => setIsSubmitOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit Work Deliverable</h3>
              <button className="btn-close" onClick={() => setIsSubmitOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitWork}>
              <div className="modal-body">
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Task #{selectedTask.id}: <strong>{selectedTask.title}</strong>
                </p>

                <div className="form-group">
                  <label>Deliverable Link / Repository / IPFS URI *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/... or https://..."
                    value={deliverableUri}
                    onChange={(e) => setDeliverableUri(e.target.value)}
                  />
                  <span className="form-hint">
                    Submission activates the review timer. If client does not approve or dispute within the review period, you can claim the timeout payout.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsSubmitOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Propose Mutual Settlement Modal */}
      {isProposeOpen && selectedTask && (
        <div className="modal-overlay" onClick={() => setIsProposeOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Propose Mutual Settlement</h3>
              <button className="btn-close" onClick={() => setIsProposeOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProposeSettlement}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Total Escrow Balance: <strong>{selectedTask.escrowBalance} BOT</strong>. The sum of the payout and refund MUST equal this exact balance.
                </p>

                <div className="form-group">
                  <label>Pay to Freelancer (BOT)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={selectedTask.escrowBalance}
                    value={settlementForm.freelancerAmount}
                    onChange={(e) => {
                      const fVal = parseFloat(e.target.value) || 0;
                      const total = parseFloat(selectedTask.escrowBalance);
                      const cVal = Math.max(0, total - fVal).toFixed(2);
                      setSettlementForm({
                        ...settlementForm,
                        freelancerAmount: e.target.value,
                        clientAmount: cVal,
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Refund to Client (BOT)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={selectedTask.escrowBalance}
                    value={settlementForm.clientAmount}
                    onChange={(e) => {
                      const cVal = parseFloat(e.target.value) || 0;
                      const total = parseFloat(selectedTask.escrowBalance);
                      const fVal = Math.max(0, total - cVal).toFixed(2);
                      setSettlementForm({
                        ...settlementForm,
                        clientAmount: e.target.value,
                        freelancerAmount: fVal,
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Proposal Validity Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settlementForm.durationDays}
                    onChange={(e) => setSettlementForm({ ...settlementForm, durationDays: e.target.value })}
                  />
                  <span className="form-hint">
                    Counterparty must accept before expiration. Proposer can cancel anytime prior to acceptance.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsProposeOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Raise Dispute Modal */}
      {isDisputeOpen && selectedTask && (
        <div className="modal-overlay" onClick={() => setIsDisputeOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Raise Escrow Dispute</h3>
              <button className="btn-close" onClick={() => setIsDisputeOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRaiseDispute}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: '#fb7185' }}>
                  Raising a dispute freezes normal approval/cancellation and assigns the task to the designated arbiter.
                </p>

                <div className="form-group">
                  <label>Dispute Reason & Evidence *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details of the disagreement (e.g. unfulfilled specs, missed deadlines, or unresponsive counterparty)..."
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsDisputeOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-danger">
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Arbitrate Dispute Modal (Restricted Arbiter Role) */}
      {isArbitrateOpen && selectedTask && (
        <div className="modal-overlay" onClick={() => setIsArbitrateOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Admin Arbitration Resolution</h3>
              <button className="btn-close" onClick={() => setIsArbitrateOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResolveDispute}>
              <div className="modal-body">
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '10px', padding: '0.85rem', fontSize: '0.82rem', color: '#a5b4fc' }}>
                  <strong>Security Rule Enforced:</strong> The arbiter cannot transfer funds to arbitrary addresses or withdraw escrow funds for personal use. Funds are strictly split between Client ({shortAddr(selectedTask.client)}) and Freelancer ({shortAddr(selectedTask.freelancer)}).
                </div>

                <div className="form-group">
                  <label>Award to Freelancer (BOT)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={selectedTask.escrowBalance}
                    value={arbitrateForm.freelancerAmount}
                    onChange={(e) => {
                      const fVal = parseFloat(e.target.value) || 0;
                      const total = parseFloat(selectedTask.escrowBalance);
                      const cVal = Math.max(0, total - fVal).toFixed(2);
                      setArbitrateForm({
                        freelancerAmount: e.target.value,
                        clientAmount: cVal,
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Refund to Client (BOT)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={selectedTask.escrowBalance}
                    value={arbitrateForm.clientAmount}
                    onChange={(e) => {
                      const cVal = parseFloat(e.target.value) || 0;
                      const total = parseFloat(selectedTask.escrowBalance);
                      const fVal = Math.max(0, total - cVal).toFixed(2);
                      setArbitrateForm({
                        clientAmount: e.target.value,
                        freelancerAmount: fVal,
                      });
                    }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsArbitrateOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
                  Execute Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
