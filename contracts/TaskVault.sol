// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TaskVault
 * @notice Trust-minimized smart-contract escrow for freelance jobs on EVM (BOT Chain).
 *         Supports direct-hire MVP, auto-release review timeouts, mutual settlements,
 *         and restricted admin arbitration.
 *
 * Security Features:
 * - Direct hire: freelancer is designated and locked at task creation.
 * - Client cannot change freelancer or withdraw funds without defined cancellation/refund rules.
 * - Mutual settlements require explicit acceptance from counterparty and exact escrow match.
 * - Arbiter can ONLY distribute funds between client and freelancer; cannot divert funds or self-payout.
 * - ReentrancyGuard and CEI (Checks-Effects-Interactions) on all ETH distributions.
 */
contract TaskVault is ReentrancyGuard, Ownable {
    // --- Data Types ---

    enum TaskStatus {
        Created,     // Created & funded by client, awaiting freelancer acceptance
        InProgress,  // Accepted by freelancer, work in progress
        Submitted,   // Deliverable submitted, review timer active
        Completed,   // Approved by client, funds paid to freelancer
        Disputed,    // Dispute raised by either party
        Resolved,    // Mutually settled or resolved by arbiter
        Cancelled    // Cancelled / refunded per contract rules
    }

    struct SettlementProposal {
        address proposedBy;
        uint256 freelancerAmount;
        uint256 clientAmount;
        uint256 expiresAt;
        bool active;
    }

    struct Task {
        uint256 id;
        address client;
        address freelancer;
        uint256 escrowBalance;
        uint256 initialAmount;
        uint256 deadline;       // Freelancer work deadline (timestamp)
        uint256 reviewPeriod;   // Duration for client review after submission (seconds)
        uint256 submittedAt;    // Timestamp of deliverable submission
        TaskStatus status;
        string title;
        string description;
        string deliverableUri;
        SettlementProposal proposal;
    }

    // --- State Variables ---

    uint256 public taskCount;
    address public arbiter;

    // taskId => Task
    mapping(uint256 => Task) public tasks;

    // Indexed lookups for frontend queries
    mapping(address => uint256[]) private _clientTasks;
    mapping(address => uint256[]) private _freelancerTasks;

    // --- Custom Errors ---

    error ZeroAddress();
    error InvalidAmount();
    error InvalidDeadline();
    error Unauthorized();
    error InvalidTaskStatus(TaskStatus current);
    error SelfHiringNotAllowed();
    error ReviewPeriodNotExpired(uint256 currentTime, uint256 claimableAt);
    error DeadlineNotPassed(uint256 currentTime, uint256 deadline);
    error CannotCancelAfterSubmission();
    error InvalidSettlementSum(uint256 totalProvided, uint256 expectedBalance);
    error SettlementExpired(uint256 currentTime, uint256 expiresAt);
    error NoActiveSettlement();
    error CannotAcceptOwnProposal();
    error DisputeAlreadyActive();
    error TaskAlreadyFinalized();
    error ETHTransferFailed(address recipient);

    // --- Events ---

    event TaskCreated(
        uint256 indexed taskId,
        address indexed client,
        address indexed freelancer,
        uint256 amount,
        uint256 deadline,
        uint256 reviewPeriod,
        string title
    );
    event TaskAccepted(uint256 indexed taskId, address indexed freelancer);
    event WorkSubmitted(uint256 indexed taskId, address indexed freelancer, string deliverableUri);
    event WorkApproved(uint256 indexed taskId, address indexed client, uint256 amountPaid);
    event TimeoutPayoutClaimed(uint256 indexed taskId, address indexed freelancer, uint256 amountPaid);
    event TaskCancelled(uint256 indexed taskId, address indexed client, uint256 refundAmount);
    
    event SettlementProposed(
        uint256 indexed taskId,
        address indexed proposedBy,
        uint256 freelancerAmount,
        uint256 clientAmount,
        uint256 expiresAt
    );
    event SettlementCancelled(uint256 indexed taskId, address indexed cancelledBy);
    event SettlementAccepted(
        uint256 indexed taskId,
        address indexed acceptedBy,
        uint256 freelancerAmount,
        uint256 clientAmount
    );

    event DisputeRaised(uint256 indexed taskId, address indexed raisedBy, string reason);
    event DisputeResolved(
        uint256 indexed taskId,
        address indexed arbiterAddress,
        uint256 freelancerAmount,
        uint256 clientAmount
    );
    event ArbiterUpdated(address indexed oldArbiter, address indexed newArbiter);

    // --- Modifiers ---

    modifier onlyClient(uint256 taskId) {
        if (msg.sender != tasks[taskId].client) revert Unauthorized();
        _;
    }

    modifier onlyFreelancer(uint256 taskId) {
        if (msg.sender != tasks[taskId].freelancer) revert Unauthorized();
        _;
    }

    modifier onlyParty(uint256 taskId) {
        address client = tasks[taskId].client;
        address freelancer = tasks[taskId].freelancer;
        if (msg.sender != client && msg.sender != freelancer) revert Unauthorized();
        _;
    }

    modifier onlyArbiter() {
        if (msg.sender != arbiter) revert Unauthorized();
        _;
    }

    // --- Constructor ---

    constructor(address initialArbiter) Ownable(msg.sender) {
        if (initialArbiter == address(0)) revert ZeroAddress();
        arbiter = initialArbiter;
        emit ArbiterUpdated(address(0), initialArbiter);
    }

    // --- Admin Functions ---

    /**
     * @notice Change the designated arbiter. Callable by contract owner or current arbiter.
     */
    function setArbiter(address newArbiter) external {
        if (msg.sender != owner() && msg.sender != arbiter) revert Unauthorized();
        if (newArbiter == address(0)) revert ZeroAddress();
        address oldArbiter = arbiter;
        arbiter = newArbiter;
        emit ArbiterUpdated(oldArbiter, newArbiter);
    }

    // --- Core Task Lifecycle (Direct Hire MVP) ---

    /**
     * @notice Create and fund a task directly assigning a specific freelancer.
     *         The locked funds are held by TaskVault until approved, refunded, settled, or arbitrated.
     * @param freelancer Designated freelancer wallet. Cannot be zero or client's own address.
     * @param deadline Unix timestamp for task deliverable deadline.
     * @param reviewPeriod Duration in seconds client has to review deliverable before auto-release.
     * @param title Title of the freelance task.
     * @param description Brief description / requirements.
     */
    function createTask(
        address freelancer,
        uint256 deadline,
        uint256 reviewPeriod,
        string calldata title,
        string calldata description
    ) external payable nonReentrant returns (uint256 taskId) {
        if (freelancer == address(0)) revert ZeroAddress();
        if (freelancer == msg.sender) revert SelfHiringNotAllowed();
        if (msg.value == 0) revert InvalidAmount();
        if (deadline <= block.timestamp) revert InvalidDeadline();
        if (reviewPeriod < 1 hours) revert InvalidDeadline();

        taskId = ++taskCount;

        Task storage t = tasks[taskId];
        t.id = taskId;
        t.client = msg.sender;
        t.freelancer = freelancer;
        t.escrowBalance = msg.value;
        t.initialAmount = msg.value;
        t.deadline = deadline;
        t.reviewPeriod = reviewPeriod;
        t.status = TaskStatus.Created;
        t.title = title;
        t.description = description;

        _clientTasks[msg.sender].push(taskId);
        _freelancerTasks[freelancer].push(taskId);

        emit TaskCreated(
            taskId,
            msg.sender,
            freelancer,
            msg.value,
            deadline,
            reviewPeriod,
            title
        );
    }

    /**
     * @notice Designated freelancer accepts the task to begin work.
     */
    function acceptTask(uint256 taskId) external onlyFreelancer(taskId) {
        Task storage t = tasks[taskId];
        if (t.status != TaskStatus.Created) revert InvalidTaskStatus(t.status);

        t.status = TaskStatus.InProgress;
        emit TaskAccepted(taskId, msg.sender);
    }

    /**
     * @notice Freelancer submits the completed deliverable link/hash for client review.
     *         Starts the review timer countdown.
     */
    function submitWork(
        uint256 taskId,
        string calldata deliverableUri
    ) external onlyFreelancer(taskId) {
        Task storage t = tasks[taskId];
        if (t.status != TaskStatus.InProgress && t.status != TaskStatus.Submitted) {
            revert InvalidTaskStatus(t.status);
        }
        if (bytes(deliverableUri).length == 0) revert InvalidAmount();

        t.deliverableUri = deliverableUri;
        t.submittedAt = block.timestamp;
        t.status = TaskStatus.Submitted;

        // Reset any prior unaccepted proposal if resubmitting
        if (t.proposal.active) {
            t.proposal.active = false;
        }

        emit WorkSubmitted(taskId, msg.sender, deliverableUri);
    }

    /**
     * @notice Client approves the submitted work and releases 100% of escrow funds to freelancer.
     */
    function approveWork(uint256 taskId) external onlyClient(taskId) nonReentrant {
        Task storage t = tasks[taskId];
        if (t.status != TaskStatus.Submitted) revert InvalidTaskStatus(t.status);

        uint256 amount = t.escrowBalance;
        if (amount == 0) revert InvalidAmount();

        t.escrowBalance = 0;
        t.status = TaskStatus.Completed;
        if (t.proposal.active) {
            t.proposal.active = false;
        }

        emit WorkApproved(taskId, msg.sender, amount);
        _safeTransferETH(t.freelancer, amount);
    }

    /**
     * @notice Auto-release payout if client ghosts after deliverable submission.
     *         Freelancer can call this after reviewPeriod has elapsed without client response/dispute.
     */
    function claimTimeoutPayout(uint256 taskId) external onlyFreelancer(taskId) nonReentrant {
        Task storage t = tasks[taskId];
        if (t.status != TaskStatus.Submitted) revert InvalidTaskStatus(t.status);

        uint256 claimableAt = t.submittedAt + t.reviewPeriod;
        if (block.timestamp < claimableAt) {
            revert ReviewPeriodNotExpired(block.timestamp, claimableAt);
        }

        uint256 amount = t.escrowBalance;
        if (amount == 0) revert InvalidAmount();

        t.escrowBalance = 0;
        t.status = TaskStatus.Completed;
        if (t.proposal.active) {
            t.proposal.active = false;
        }

        emit TimeoutPayoutClaimed(taskId, msg.sender, amount);
        _safeTransferETH(t.freelancer, amount);
    }

    /**
     * @notice Fair client cancellation & refund:
     *         1) Allowed if freelancer has not accepted yet (Status == Created).
     *         2) Allowed if freelancer accepted (Status == InProgress) but deadline passed without work submission.
     *         Disallowed once work has been submitted or completed.
     */
    function clientCancel(uint256 taskId) external onlyClient(taskId) nonReentrant {
        Task storage t = tasks[taskId];

        if (t.status == TaskStatus.Created) {
            // Cancel allowed before freelancer accepts
        } else if (t.status == TaskStatus.InProgress) {
            if (block.timestamp <= t.deadline) {
                revert DeadlineNotPassed(block.timestamp, t.deadline);
            }
        } else {
            revert CannotCancelAfterSubmission();
        }

        uint256 refundAmount = t.escrowBalance;
        if (refundAmount == 0) revert InvalidAmount();

        t.escrowBalance = 0;
        t.status = TaskStatus.Cancelled;
        if (t.proposal.active) {
            t.proposal.active = false;
        }

        emit TaskCancelled(taskId, msg.sender, refundAmount);
        _safeTransferETH(t.client, refundAmount);
    }

    // --- Mutual Settlement Mechanism ---

    /**
     * @notice Either client or freelancer can propose a mutual settlement distribution.
     * @param taskId ID of the task.
     * @param freelancerAmount Amount to be paid to the freelancer.
     * @param clientAmount Amount to be refunded to the client.
     * @param validityDuration Duration in seconds until proposal expires (between 1 hour and 30 days).
     */
    function proposeSettlement(
        uint256 taskId,
        uint256 freelancerAmount,
        uint256 clientAmount,
        uint256 validityDuration
    ) external onlyParty(taskId) {
        Task storage t = tasks[taskId];

        if (
            t.status != TaskStatus.InProgress &&
            t.status != TaskStatus.Submitted &&
            t.status != TaskStatus.Disputed
        ) {
            revert InvalidTaskStatus(t.status);
        }

        if (freelancerAmount + clientAmount != t.escrowBalance) {
            revert InvalidSettlementSum(freelancerAmount + clientAmount, t.escrowBalance);
        }

        if (validityDuration < 1 hours || validityDuration > 30 days) {
            revert InvalidDeadline();
        }

        uint256 expiresAt = block.timestamp + validityDuration;
        t.proposal = SettlementProposal({
            proposedBy: msg.sender,
            freelancerAmount: freelancerAmount,
            clientAmount: clientAmount,
            expiresAt: expiresAt,
            active: true
        });

        emit SettlementProposed(taskId, msg.sender, freelancerAmount, clientAmount, expiresAt);
    }

    /**
     * @notice Cancel an active settlement proposal. Proposer can cancel anytime; counterparty can cancel if expired.
     */
    function cancelSettlement(uint256 taskId) external onlyParty(taskId) {
        Task storage t = tasks[taskId];
        if (!t.proposal.active) revert NoActiveSettlement();

        if (msg.sender != t.proposal.proposedBy && block.timestamp <= t.proposal.expiresAt) {
            revert Unauthorized();
        }

        t.proposal.active = false;
        emit SettlementCancelled(taskId, msg.sender);
    }

    /**
     * @notice Counterparty accepts the active settlement proposal, releasing funds immediately.
     */
    function acceptSettlement(uint256 taskId) external onlyParty(taskId) nonReentrant {
        Task storage t = tasks[taskId];
        SettlementProposal memory prop = t.proposal;

        if (!prop.active) revert NoActiveSettlement();
        if (msg.sender == prop.proposedBy) revert CannotAcceptOwnProposal();
        if (block.timestamp > prop.expiresAt) revert SettlementExpired(block.timestamp, prop.expiresAt);

        uint256 currentBalance = t.escrowBalance;
        if (prop.freelancerAmount + prop.clientAmount != currentBalance) {
            revert InvalidSettlementSum(prop.freelancerAmount + prop.clientAmount, currentBalance);
        }

        // State update (Checks-Effects)
        t.escrowBalance = 0;
        t.proposal.active = false;
        t.status = TaskStatus.Resolved;

        emit SettlementAccepted(
            taskId,
            msg.sender,
            prop.freelancerAmount,
            prop.clientAmount
        );

        // Interactions
        if (prop.freelancerAmount > 0) {
            _safeTransferETH(t.freelancer, prop.freelancerAmount);
        }
        if (prop.clientAmount > 0) {
            _safeTransferETH(t.client, prop.clientAmount);
        }
    }

    // --- Admin Arbitration Mechanism ---

    /**
     * @notice Raise a dispute if mutual agreement fails.
     *         Only callable by client or freelancer on active tasks (InProgress or Submitted).
     */
    function raiseDispute(uint256 taskId, string calldata reason) external onlyParty(taskId) {
        Task storage t = tasks[taskId];

        if (t.status == TaskStatus.Disputed) revert DisputeAlreadyActive();
        if (t.status != TaskStatus.InProgress && t.status != TaskStatus.Submitted) {
            revert InvalidTaskStatus(t.status);
        }

        t.status = TaskStatus.Disputed;
        if (t.proposal.active) {
            t.proposal.active = false;
        }

        emit DisputeRaised(taskId, msg.sender, reason);
    }

    /**
     * @notice Arbiter resolves the dispute.
     *
     * STRICT SECURITY CONSTRAINTS:
     * - Only the designated arbiter can call.
     * - Can only be called on Disputed tasks.
     * - Funds can ONLY be distributed to the task's client and freelancer.
     * - Total distribution MUST exactly equal the remaining escrowBalance.
     * - Arbiter CANNOT divert funds to an arbitrary address or withdraw to themselves.
     */
    function resolveDispute(
        uint256 taskId,
        uint256 freelancerAmount,
        uint256 clientAmount
    ) external onlyArbiter nonReentrant {
        Task storage t = tasks[taskId];

        if (t.status != TaskStatus.Disputed) revert InvalidTaskStatus(t.status);

        uint256 currentBalance = t.escrowBalance;
        if (freelancerAmount + clientAmount != currentBalance) {
            revert InvalidSettlementSum(freelancerAmount + clientAmount, currentBalance);
        }

        // Checks-Effects
        t.escrowBalance = 0;
        t.status = TaskStatus.Resolved;
        if (t.proposal.active) {
            t.proposal.active = false;
        }

        emit DisputeResolved(taskId, msg.sender, freelancerAmount, clientAmount);

        // Interactions strictly to client and freelancer
        if (freelancerAmount > 0) {
            _safeTransferETH(t.freelancer, freelancerAmount);
        }
        if (clientAmount > 0) {
            _safeTransferETH(t.client, clientAmount);
        }
    }

    // --- Internal Helpers ---

    function _safeTransferETH(address recipient, uint256 amount) internal {
        (bool success, ) = payable(recipient).call{value: amount}("");
        if (!success) revert ETHTransferFailed(recipient);
    }

    // --- View Functions ---

    function getTask(uint256 taskId) external view returns (Task memory) {
        return tasks[taskId];
    }

    function getTasksByClient(address client) external view returns (uint256[] memory) {
        return _clientTasks[client];
    }

    function getTasksByFreelancer(address freelancer) external view returns (uint256[] memory) {
        return _freelancerTasks[freelancer];
    }

    function getActiveProposal(uint256 taskId) external view returns (SettlementProposal memory) {
        return tasks[taskId].proposal;
    }
}
