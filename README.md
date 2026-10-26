# TaskVault — Smart-Contract Escrow for Freelance Jobs

TaskVault is a trust-minimized, decentralized escrow dApp built for freelance jobs on **Bohr BOT Chain** (Chain ID: `968`). It eliminates counterparty risk by locking project bounties in a smart contract and enforcing programmatic rules for deliverables, review timeouts, mutual settlements, and restricted arbitration.

---

## 🌟 Core Features

### 1. Direct-Hire Escrow (MVP)
* **Designated Freelancer Assignment**: At task creation, the client locks the agreed BOT bounty and designates the freelancer's wallet address.
* **Locked Assignment & Anti-Trap Protection**: The client cannot change the assigned freelancer while funds are locked without going through the formal cancellation or refund process.
* **Escrow Holding**: 100% of the bounty (`msg.value`) is held by `TaskVault.sol`.
* **Deliverable Submission & Review**: Freelancers submit deliverables with verifiable links/hashes, starting a client review countdown.
* **Instant Release**: When the client approves the work, funds are released directly to the freelancer.

### 2. Fair Timeout & "Ghost Client" Protection
* **Auto-Release Review Timer**: If the freelancer submits work and the client fails to approve or raise a dispute within the review period (e.g. 3–7 days), the freelancer can call `claimTimeoutPayout()` to unlock their full payment automatically.
* **Client Cancellation Rules**:
  * **Before Acceptance**: The client can cancel anytime if the freelancer hasn't accepted.
  * **Missed Deadline**: If the work deadline passes without deliverable submission, the client can cancel and withdraw 100% of their deposit.
  * **Post-Submission Protection**: The client *cannot* cancel once work has been submitted.

### 3. Mutual Settlement
* Either the client or the freelancer can propose a custom split of the locked escrow balance (`freelancerAmount + clientAmount == escrowBalance`).
* The counterparty must explicitly sign/accept the proposal before execution.
* The proposal expires after an agreed duration or can be cancelled by the proposer.
* Prevents double payouts and guarantees balance conservation.

### 4. Restricted Admin Arbitration
* If a mutual settlement cannot be reached, either party can raise a dispute (`raiseDispute()`).
* **Strict Arbiter Constraints**:
  * Only the designated arbiter can resolve active disputes.
  * Payouts can **ONLY** be directed to the task's client and freelancer.
  * The arbiter **CANNOT** divert escrow funds to arbitrary third-party addresses or withdraw funds to themselves.
  * Total distribution must exactly match the remaining escrow balance.

---

## ⛓️ Network Specifications (Bohr Testnet)

| Parameter | Value |
|---|---|
| **Network Name** | Bohr Testnet |
| **Chain ID** | `968` |
| **RPC URL** | [https://rpc.bohr.life](https://rpc.bohr.life) |
| **Native Token** | `BOT` (18 Decimals) |
| **Block Explorer** | [https://scan.bohr.life/](https://scan.bohr.life/) |
| **Total Supply** | 150 Million BOT |

---

## 🧪 Automated Test Suite

The smart contract is validated by 22 comprehensive automated tests covering all critical edge cases:

```bash
npx hardhat test
```

### Test Coverage Highlights:
* ✔ **Direct Hire & Address Validation**: Zero address checks, self-hiring prevention, and unauthorized access rejection.
* ✔ **Freelancer Locking**: Non-assigned freelancers cannot accept tasks or submit work.
* ✔ **Double Payout Prevention**: Multiple approvals, duplicate timeout claims, or post-settlement payouts strictly revert.
* ✔ **Fair Timeout & Cancellation**: Early timeout claims revert; post-deadline refunds succeed; post-submission cancellations revert.
* ✔ **Mutual Settlement Invariants**: Sum mismatch reverts, proposer self-acceptance reverts, and expired proposal reverts.
* ✔ **Arbitration Security**: Unauthorized callers cannot arbitrate; arbiter cannot exceed escrow balance; arbiter cannot self-payout; already completed or cancelled tasks cannot be disputed.

---

## 💻 Tech Stack

* **Smart Contract**: Solidity `^0.8.24` (Shanghai EVM target, `viaIR: true`, ReentrancyGuard, Ownable).
* **Testing Framework**: Hardhat 3 with native Solidity test runner and EVM cheatcodes.
* **Frontend**: React 19 + Vite 6 + Vanilla CSS (Obsidian glassmorphic design system).
* **Web3 Integration**: `@reown/appkit`, `@reown/appkit-adapter-wagmi`, `wagmi@2.x`, `viem`, and `@tanstack/react-query`.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Contract Tests
```bash
npx hardhat test
```

### 3. Deploy to Bohr Testnet
```bash
# Set your deployer private key
set PRIVATE_KEY=0x...
node scripts/deploy.js
```

### 4. Start the Frontend dApp
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.
