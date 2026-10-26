// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../contracts/TaskVault.sol";

interface Vm {
    function prank(address) external;
    function warp(uint256) external;
    function deal(address, uint256) external;
    function expectRevert(bytes calldata) external;
}

contract TaskVaultTest {
    Vm constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    TaskVault public vault;
    address public arbiter = address(0xAA);
    address public client = address(0x1111);
    address public freelancer = address(0x2222);
    address public attacker = address(0x9999);

    uint256 constant TASK_DEPOSIT = 1 ether;
    uint256 constant TASK_DURATION = 7 days;
    uint256 constant REVIEW_PERIOD = 3 days;

    function setUp() public {
        vault = new TaskVault(arbiter);
        vm.deal(client, 50 ether);
        vm.deal(freelancer, 10 ether);
        vm.deal(attacker, 10 ether);
    }

    // --- Direct Hire & Task Creation Tests ---

    function test_CreateTask_DirectHireSuccess() public {
        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Build Landing Page",
            "Responsive landing page with Web3 integration"
        );

        TaskVault.Task memory t = vault.getTask(taskId);
        require(t.id == taskId, "Task ID mismatch");
        require(t.client == client, "Client mismatch");
        require(t.freelancer == freelancer, "Freelancer mismatch");
        require(t.escrowBalance == TASK_DEPOSIT, "Escrow balance mismatch");
        require(t.status == TaskVault.TaskStatus.Created, "Status should be Created");
    }

    function test_CreateTask_RevertIfSelfHiring() public {
        vm.prank(client);
        try vault.createTask{value: TASK_DEPOSIT}(
            client,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Self Task",
            "Desc"
        ) {
            revert("Should have reverted on self-hiring");
        } catch {
            // Expected
        }
    }

    function test_CreateTask_RevertIfZeroAddress() public {
        vm.prank(client);
        try vault.createTask{value: TASK_DEPOSIT}(
            address(0),
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Zero Address Task",
            "Desc"
        ) {
            revert("Should have reverted on zero address");
        } catch {
            // Expected
        }
    }

    function test_CreateTask_RevertIfZeroAmount() public {
        vm.prank(client);
        try vault.createTask{value: 0}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Zero Amount Task",
            "Desc"
        ) {
            revert("Should have reverted on zero deposit");
        } catch {
            // Expected
        }
    }

    // --- Freelancer Acceptance & Work Submission Tests ---

    function test_AcceptTask_OnlyAssignedFreelancer() public {
        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );

        // Attacker attempts to accept
        vm.prank(attacker);
        try vault.acceptTask(taskId) {
            revert("Unauthorized freelancer should not be able to accept");
        } catch {
            // Expected revert
        }

        // Assigned freelancer accepts
        vm.prank(freelancer);
        vault.acceptTask(taskId);

        TaskVault.Task memory t = vault.getTask(taskId);
        require(t.status == TaskVault.TaskStatus.InProgress, "Status should be InProgress");
    }

    function test_SubmitWork_OnlyAssignedFreelancer() public {
        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );

        vm.prank(freelancer);
        vault.acceptTask(taskId);

        // Attacker attempts to submit work
        vm.prank(attacker);
        try vault.submitWork(taskId, "https://github.com/deliverable") {
            revert("Unauthorized caller should not submit work");
        } catch {
            // Expected revert
        }

        // Assigned freelancer submits work
        vm.prank(freelancer);
        vault.submitWork(taskId, "https://github.com/deliverable");

        TaskVault.Task memory t = vault.getTask(taskId);
        require(t.status == TaskVault.TaskStatus.Submitted, "Status should be Submitted");
        require(bytes(t.deliverableUri).length > 0, "Deliverable URI should be recorded");
    }

    // --- Approval & Double Payout Prevention Tests ---

    function test_ApproveWork_FullPayoutToFreelancer() public {
        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );

        vm.prank(freelancer);
        vault.acceptTask(taskId);
        vm.prank(freelancer);
        vault.submitWork(taskId, "https://example.com/site");

        uint256 initialFreelancerBalance = freelancer.balance;

        // Client approves
        vm.prank(client);
        vault.approveWork(taskId);

        TaskVault.Task memory t = vault.getTask(taskId);
        require(t.status == TaskVault.TaskStatus.Completed, "Status should be Completed");
        require(t.escrowBalance == 0, "Escrow balance should be 0");
        require(freelancer.balance == initialFreelancerBalance + TASK_DEPOSIT, "Freelancer balance mismatch");
    }

    function test_ApproveWork_RevertIfAlreadyCompleted_NoDoublePayout() public {
        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );

        vm.prank(freelancer);
        vault.acceptTask(taskId);
        vm.prank(freelancer);
        vault.submitWork(taskId, "https://example.com/site");

        vm.prank(client);
        vault.approveWork(taskId);

        // Second approval attempt MUST fail
        vm.prank(client);
        try vault.approveWork(taskId) {
            revert("Double approval must revert");
        } catch {
            // Expected
        }
    }

    // --- Fair Timeout / Review Auto-Release Tests ---

    function test_TimeoutPayout_SuccessAfterReviewPeriod() public {
        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );

        vm.prank(freelancer);
        vault.acceptTask(taskId);
        vm.prank(freelancer);
        vault.submitWork(taskId, "https://example.com/site");

        // Attempting to claim before review period expires must fail
        vm.prank(freelancer);
        try vault.claimTimeoutPayout(taskId) {
            revert("Should not claim before review period expires");
        } catch {
            // Expected
        }

        // Warp time past review period
        vm.warp(block.timestamp + REVIEW_PERIOD + 1 seconds);

        uint256 initialFreelancerBalance = freelancer.balance;

        vm.prank(freelancer);
        vault.claimTimeoutPayout(taskId);

        TaskVault.Task memory t = vault.getTask(taskId);
        require(t.status == TaskVault.TaskStatus.Completed, "Status should be Completed");
        require(t.escrowBalance == 0, "Escrow balance must be 0");
        require(freelancer.balance == initialFreelancerBalance + TASK_DEPOSIT, "Funds not released");

        // Second claim attempt must fail
        vm.prank(freelancer);
        try vault.claimTimeoutPayout(taskId) {
            revert("Double claim must revert");
        } catch {
            // Expected
        }
    }

    // --- Client Cancellation & Refund Rules ---

    function test_ClientCancel_BeforeAcceptance() public {
        uint256 initialClientBalance = client.balance;

        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );

        // Client cancels before freelancer accepts
        vm.prank(client);
        vault.clientCancel(taskId);

        TaskVault.Task memory t = vault.getTask(taskId);
        require(t.status == TaskVault.TaskStatus.Cancelled, "Status should be Cancelled");
        require(t.escrowBalance == 0, "Escrow balance must be 0");
        require(client.balance == initialClientBalance, "Client should be fully refunded");
    }

    function test_ClientCancel_RevertBeforeDeadlineWhenInProgress() public {
        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );

        vm.prank(freelancer);
        vault.acceptTask(taskId);

        // Client attempts to cancel while work is in progress before deadline
        vm.prank(client);
        try vault.clientCancel(taskId) {
            revert("Client cannot cancel while work is in progress before deadline");
        } catch {
            // Expected revert
        }
    }

    function test_ClientCancel_AllowedAfterDeadlineIfMissed() public {
        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );

        vm.prank(freelancer);
        vault.acceptTask(taskId);

        // Warp past deadline
        vm.warp(block.timestamp + TASK_DURATION + 1 seconds);

        uint256 clientBalanceBefore = client.balance;
        vm.prank(client);
        vault.clientCancel(taskId);

        TaskVault.Task memory t = vault.getTask(taskId);
        require(t.status == TaskVault.TaskStatus.Cancelled, "Status should be Cancelled");
        require(client.balance == clientBalanceBefore + TASK_DEPOSIT, "Client refund mismatch");
    }

    function test_ClientCancel_RevertAfterSubmission() public {
        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );

        vm.prank(freelancer);
        vault.acceptTask(taskId);
        vm.prank(freelancer);
        vault.submitWork(taskId, "https://example.com/site");

        // Warp past deadline
        vm.warp(block.timestamp + TASK_DURATION + 1 seconds);

        // Client cannot cancel once work has been submitted
        vm.prank(client);
        try vault.clientCancel(taskId) {
            revert("Client cannot cancel after deliverable has been submitted");
        } catch {
            // Expected
        }
    }

    // --- Mutual Settlement Tests ---

    function test_MutualSettlement_Success() public {
        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );

        vm.prank(freelancer);
        vault.acceptTask(taskId);

        // Client proposes 0.6 to freelancer, 0.4 refund to client
        uint256 fAmount = 0.6 ether;
        uint256 cAmount = 0.4 ether;

        vm.prank(client);
        vault.proposeSettlement(taskId, fAmount, cAmount, 2 days);

        // Proposer cannot accept their own settlement
        vm.prank(client);
        try vault.acceptSettlement(taskId) {
            revert("Proposer cannot accept own proposal");
        } catch {
            // Expected
        }

        // Attacker cannot accept
        vm.prank(attacker);
        try vault.acceptSettlement(taskId) {
            revert("Third party cannot accept settlement");
        } catch {
            // Expected
        }

        uint256 fBalBefore = freelancer.balance;
        uint256 cBalBefore = client.balance;

        // Freelancer accepts proposal
        vm.prank(freelancer);
        vault.acceptSettlement(taskId);

        TaskVault.Task memory t = vault.getTask(taskId);
        require(t.status == TaskVault.TaskStatus.Resolved, "Status should be Resolved");
        require(t.escrowBalance == 0, "Escrow balance should be 0");
        require(freelancer.balance == fBalBefore + fAmount, "Freelancer split mismatch");
        require(client.balance == cBalBefore + cAmount, "Client split mismatch");

        // Double acceptance must fail
        vm.prank(freelancer);
        try vault.acceptSettlement(taskId) {
            revert("Double settlement acceptance must revert");
        } catch {
            // Expected
        }
    }

    function test_MutualSettlement_RevertIfSumMismatch() public {
        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );

        vm.prank(freelancer);
        vault.acceptTask(taskId);

        // Proposing sum exceeding escrow balance (1.1 ether > 1.0 ether)
        vm.prank(client);
        try vault.proposeSettlement(taskId, 0.7 ether, 0.4 ether, 2 days) {
            revert("Should revert on sum exceeding escrow balance");
        } catch {
            // Expected
        }

        // Proposing sum less than escrow balance (0.8 ether < 1.0 ether)
        vm.prank(client);
        try vault.proposeSettlement(taskId, 0.4 ether, 0.4 ether, 2 days) {
            revert("Should revert on sum less than escrow balance");
        } catch {
            // Expected
        }
    }

    function test_MutualSettlement_RevertIfExpired() public {
        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );

        vm.prank(freelancer);
        vault.acceptTask(taskId);

        vm.prank(client);
        vault.proposeSettlement(taskId, 0.5 ether, 0.5 ether, 1 days);

        // Warp past expiration
        vm.warp(block.timestamp + 1 days + 1 seconds);

        vm.prank(freelancer);
        try vault.acceptSettlement(taskId) {
            revert("Cannot accept expired settlement proposal");
        } catch {
            // Expected
        }
    }

    function test_MutualSettlement_CancelProposal() public {
        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );

        vm.prank(freelancer);
        vault.acceptTask(taskId);

        vm.prank(client);
        vault.proposeSettlement(taskId, 0.5 ether, 0.5 ether, 2 days);

        // Client cancels their proposal
        vm.prank(client);
        vault.cancelSettlement(taskId);

        // Freelancer can no longer accept
        vm.prank(freelancer);
        try vault.acceptSettlement(taskId) {
            revert("Cannot accept cancelled settlement");
        } catch {
            // Expected
        }
    }

    // --- Dispute & Admin Arbitration Security Tests ---

    function test_Arbitration_UnauthorizedCaller() public {
        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );

        vm.prank(freelancer);
        vault.acceptTask(taskId);

        // Raise dispute
        vm.prank(client);
        vault.raiseDispute(taskId, "Scope disagreement");

        // Attacker attempts to arbitrate
        vm.prank(attacker);
        try vault.resolveDispute(taskId, 0.5 ether, 0.5 ether) {
            revert("Unauthorized caller must not arbitrate");
        } catch {
            // Expected revert
        }

        // Client attempts to arbitrate
        vm.prank(client);
        try vault.resolveDispute(taskId, 0.5 ether, 0.5 ether) {
            revert("Client must not arbitrate");
        } catch {
            // Expected revert
        }
    }

    function test_Arbitration_RevertIfInvalidSum() public {
        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );

        vm.prank(freelancer);
        vault.acceptTask(taskId);

        vm.prank(client);
        vault.raiseDispute(taskId, "Dispute");

        // Arbiter attempts invalid sum (total 1.2 ether vs 1.0 ether escrow)
        vm.prank(arbiter);
        try vault.resolveDispute(taskId, 0.7 ether, 0.5 ether) {
            revert("Arbiter cannot exceed escrow balance");
        } catch {
            // Expected
        }
    }

    function test_Arbitration_SuccessAndFundsRestrictedToParties() public {
        vm.prank(client);
        uint256 taskId = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );

        vm.prank(freelancer);
        vault.acceptTask(taskId);

        vm.prank(freelancer);
        vault.raiseDispute(taskId, "Client unresponsive to review");

        uint256 fBalBefore = freelancer.balance;
        uint256 cBalBefore = client.balance;
        uint256 arbiterBalBefore = arbiter.balance;

        uint256 fAward = 0.75 ether;
        uint256 cRefund = 0.25 ether;

        // Arbiter resolves
        vm.prank(arbiter);
        vault.resolveDispute(taskId, fAward, cRefund);

        TaskVault.Task memory t = vault.getTask(taskId);
        require(t.status == TaskVault.TaskStatus.Resolved, "Status should be Resolved");
        require(t.escrowBalance == 0, "Escrow balance should be 0");
        require(freelancer.balance == fBalBefore + fAward, "Freelancer award mismatch");
        require(client.balance == cBalBefore + cRefund, "Client refund mismatch");
        // Crucial security invariant: Arbiter cannot divert funds to self
        require(arbiter.balance == arbiterBalBefore, "Arbiter must not receive escrow funds");
    }

    function test_Disputes_CannotDisputeCompletedOrCancelledTasks() public {
        // Test Completed task
        vm.prank(client);
        uint256 taskId1 = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 1",
            "Desc 1"
        );
        vm.prank(freelancer);
        vault.acceptTask(taskId1);
        vm.prank(freelancer);
        vault.submitWork(taskId1, "deliverable");
        vm.prank(client);
        vault.approveWork(taskId1);

        // Attempting to dispute completed task must fail
        vm.prank(client);
        try vault.raiseDispute(taskId1, "Late dispute") {
            revert("Cannot dispute completed task");
        } catch {
            // Expected
        }

        // Test Cancelled task
        vm.prank(client);
        uint256 taskId2 = vault.createTask{value: TASK_DEPOSIT}(
            freelancer,
            block.timestamp + TASK_DURATION,
            REVIEW_PERIOD,
            "Task 2",
            "Desc 2"
        );
        vm.prank(client);
        vault.clientCancel(taskId2);

        // Attempting to dispute cancelled task must fail
        vm.prank(client);
        try vault.raiseDispute(taskId2, "Dispute cancelled") {
            revert("Cannot dispute cancelled task");
        } catch {
            // Expected
        }
    }

    function test_ArbiterUpdate_OnlyOwnerOrCurrentArbiter() public {
        address newArbiter = address(0xBB);

        // Attacker cannot update arbiter
        vm.prank(attacker);
        try vault.setArbiter(newArbiter) {
            revert("Unauthorized cannot update arbiter");
        } catch {
            // Expected
        }

        // Current arbiter can update
        vm.prank(arbiter);
        vault.setArbiter(newArbiter);
        require(vault.arbiter() == newArbiter, "New arbiter mismatch");
    }
}
