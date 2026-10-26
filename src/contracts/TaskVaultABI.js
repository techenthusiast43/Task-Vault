export const TASK_VAULT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "initialArbiter",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "CannotAcceptOwnProposal",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CannotCancelAfterSubmission",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "currentTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "DeadlineNotPassed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DisputeAlreadyActive",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "ETHTransferFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAmount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidDeadline",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "totalProvided",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "expectedBalance",
        "type": "uint256"
      }
    ],
    "name": "InvalidSettlementSum",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "enum TaskVault.TaskStatus",
        "name": "current",
        "type": "uint8"
      }
    ],
    "name": "InvalidTaskStatus",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoActiveSettlement",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "currentTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "claimableAt",
        "type": "uint256"
      }
    ],
    "name": "ReviewPeriodNotExpired",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "SelfHiringNotAllowed",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "currentTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "expiresAt",
        "type": "uint256"
      }
    ],
    "name": "SettlementExpired",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TaskAlreadyFinalized",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Unauthorized",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZeroAddress",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldArbiter",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newArbiter",
        "type": "address"
      }
    ],
    "name": "ArbiterUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "raisedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "DisputeRaised",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "arbiterAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "freelancerAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "clientAmount",
        "type": "uint256"
      }
    ],
    "name": "DisputeResolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "acceptedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "freelancerAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "clientAmount",
        "type": "uint256"
      }
    ],
    "name": "SettlementAccepted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "cancelledBy",
        "type": "address"
      }
    ],
    "name": "SettlementCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "proposedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "freelancerAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "clientAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "expiresAt",
        "type": "uint256"
      }
    ],
    "name": "SettlementProposed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "freelancer",
        "type": "address"
      }
    ],
    "name": "TaskAccepted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "client",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "refundAmount",
        "type": "uint256"
      }
    ],
    "name": "TaskCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "client",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "freelancer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "reviewPeriod",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
      }
    ],
    "name": "TaskCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "freelancer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountPaid",
        "type": "uint256"
      }
    ],
    "name": "TimeoutPayoutClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "client",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountPaid",
        "type": "uint256"
      }
    ],
    "name": "WorkApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "freelancer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "deliverableUri",
        "type": "string"
      }
    ],
    "name": "WorkSubmitted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      }
    ],
    "name": "acceptSettlement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      }
    ],
    "name": "acceptTask",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      }
    ],
    "name": "approveWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "arbiter",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      }
    ],
    "name": "cancelSettlement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      }
    ],
    "name": "claimTimeoutPayout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      }
    ],
    "name": "clientCancel",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "freelancer",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "reviewPeriod",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "createTask",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      }
    ],
    "name": "getActiveProposal",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "proposedBy",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "freelancerAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "clientAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "expiresAt",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct TaskVault.SettlementProposal",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      }
    ],
    "name": "getTask",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "client",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "freelancer",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "escrowBalance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "initialAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reviewPeriod",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "submittedAt",
            "type": "uint256"
          },
          {
            "internalType": "enum TaskVault.TaskStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "deliverableUri",
            "type": "string"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "proposedBy",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "freelancerAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "clientAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "expiresAt",
                "type": "uint256"
              },
              {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
              }
            ],
            "internalType": "struct TaskVault.SettlementProposal",
            "name": "proposal",
            "type": "tuple"
          }
        ],
        "internalType": "struct TaskVault.Task",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "client",
        "type": "address"
      }
    ],
    "name": "getTasksByClient",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "freelancer",
        "type": "address"
      }
    ],
    "name": "getTasksByFreelancer",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "freelancerAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "clientAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "validityDuration",
        "type": "uint256"
      }
    ],
    "name": "proposeSettlement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "raiseDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "freelancerAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "clientAmount",
        "type": "uint256"
      }
    ],
    "name": "resolveDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newArbiter",
        "type": "address"
      }
    ],
    "name": "setArbiter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "taskId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "deliverableUri",
        "type": "string"
      }
    ],
    "name": "submitWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "taskCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "tasks",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "client",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "freelancer",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "escrowBalance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "initialAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "reviewPeriod",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "submittedAt",
        "type": "uint256"
      },
      {
        "internalType": "enum TaskVault.TaskStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "deliverableUri",
        "type": "string"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "proposedBy",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "freelancerAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "clientAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "expiresAt",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct TaskVault.SettlementProposal",
        "name": "proposal",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const TASK_VAULT_BYTECODE = "0x60803461012657601f611db338819003918201601f19168301916001600160401b0383118484101761012a5780849260209460405283398101031261012657516001600160a01b0390818116908190036101265760017f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f0055331561010e575f5460018060a01b03199033828216175f55604051933391167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a381156100ff5781906002541617600255604051905f7ff0077b1d49976ecd154f8efdc46cca625489710840b8995fb53d9efa037353ba8180a3611c74908161013f8239f35b63d92e233d60e01b8352600483fd5b604051631e4fbdf760e01b81525f6004820152602490fd5b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe6080806040526004361015610012575f80fd5b5f3560e01c9081630b397f75146116ce57508063143c515b1461160b5780631bf6912d146115825780631c9c088a146114fb5780631d65e77e146112d15780632f9d47dd146111425780633d01e0fa146110645780633fabe74f14610f495780635aef573c14610e42578063715018a614610deb5780638d97767214610cd55780638da5cb5b14610cae5780638ed9293f14610c3857806393ee267814610a6c5780639456922f14610942578063b1407faa146108bc578063b6cb58a51461089f578063d57a4a4a1461085b578063da8accf914610612578063e7f111ad146101bf578063f2fde38b1461013a5763fe25e00a1461010e575f80fd5b34610136575f366003190112610136576002546040516001600160a01b039091168152602090f35b5f80fd5b3461013657602036600319011261013657610153611806565b61015b611bf3565b6001600160a01b039081169081156101a7575f54826001600160601b0360a01b8216175f55167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3005b604051631e4fbdf760e01b81525f6004820152602490fd5b60a0366003190112610136576101d3611806565b60643567ffffffffffffffff8111610136576101f390369060040161189f565b9160843567ffffffffffffffff81116101365761021490369060040161189f565b92909361021f611b52565b6001600160a01b03831615610600576001600160a01b03831633146105ee5734156105dc574260243511156105ca57610e10604435106105ca57600154935f1985146105b65760018501600155600185015f52600360205260405f2090600186018255600182016001600160601b0360a01b903382825416179055600283019060018060a01b03871690825416179055346003830155346004830155602435600583015560443560068301556008820160ff19815416905567ffffffffffffffff83116104e9576102f36009830154611901565b601f8111610572575b50825f601f8211600114610508575f916104fd575b508360011b905f198560031b1c19161760098301555b67ffffffffffffffff81116104e957610343600a830154611901565b96601f88116104a5575b602097505f90601f831160011461043b57600a92915f9183610430575b50508160011b915f199060031b1c1916179101555b335f52600485526103966001850160405f20611b12565b60018060a01b0383165f52600585526103b56001850160405f20611b12565b7f3cb78ea53e0d00e18a029d96dd12e2baf2d32fff9c5ed50ae89e1c9f01cdff2c604051933485526024358786015260443560408601526080606086015260018060a01b03169380610411339560018901956080840191611af2565b0390a460015f80516020611c1f83398151915255600160405191018152f35b01359050898061036a565b600a84015f52885f20915f5b601f198516811061048e5750918391600193600a95601f19811610610475575b505050811b0191015561037f565b01355f19600384901b60f8161c19169055898080610467565b90928a600181928686013581550194019101610447565b600a83015f5260205f20601f830160051c8101602084106104e2575b601f8a0160051c820181106104d757505061034d565b5f81556001016104c1565b50806104c1565b634e487b7160e01b5f52604160045260245ffd5b905084013588610311565b9050600983015f5260205f20905f5b601f198616811061055a575084601f19811610610541575b5050600183811b016009830155610327565b8501355f19600386901b60f8161c19169055878061052f565b9091602060018192858a013581550193019101610517565b600983015f5260205f20601f850160051c8101602086106105af575b601f830160051c820181106105a45750506102fc565b5f815560010161058e565b508061058e565b634e487b7160e01b5f52601160045260245ffd5b604051631da7447960e21b8152600490fd5b60405163162908e360e11b8152600490fd5b604051632ffd17bf60e11b8152600490fd5b60405163d92e233d60e01b8152600490fd5b3461013657610620366118cd565b9091805f526020926003845260018060a01b03600260405f20015416330361084a57815f526003845260405f20926008840160ff815416600781101561083657600190818114158061082b575b61080b575082156105dc57600b86019067ffffffffffffffff84116104e9576106968254611901565b601f81116107c5575b505f601f8511600114610741579184807fd5d9bc882dc95f198786a74e52a0b87e49a07c80921b74821ba374339e394d309899936010955f93610736575b501b905f198760031b1c19161790555b42600782015560ff19926002848254161790550190815460ff811661072b575b5050506107266040519283928784523397840191611af2565b0390a3005b16905585808061070d565b89013592508c6106dd565b601f19851690835f52895f20915f5b8b8282106107b1575050917fd5d9bc882dc95f198786a74e52a0b87e49a07c80921b74821ba374339e394d3098999391876010969410610798575b505085811b0190556106ed565b8801355f19600389901b60f8161c191690558a8061078b565b898401358555938501939283019201610750565b825f52885f20601f860160051c8101918a8710610801575b601f0160051c019082905b8281106107f657505061069f565b5f81550182906107e8565b90915081906107dd565b6040516326778ded60e21b815260249161082990600483019061181c565bfd5b50600281141561066d565b634e487b7160e01b5f52602160045260245ffd5b6040516282b42960e81b8152600490fd5b3461013657602036600319011261013657610874611abb565b506004355f52600360205260a0610890600c60405f2001611a36565b61089d6040518092611867565bf35b34610136575f366003190112610136576020600154604051908152f35b3461013657602080600319360112610136576001600160a01b036108de611806565b165f52600460205260405f20906040519081602084549182815201935f5260205f20915f905b82821061092b576109278561091b81890382611972565b60405191829182611a80565b0390f35b835486529485019460019384019390910190610904565b34610136576020366003190112610136576004355f818152600360205260409020600201546001600160a01b03908116330361084a57610980611b52565b815f52600360205260405f2090600882019283549260ff84166007811015610836576002810361080b57506109be6007820154600683015490611ae5565b804210610a4e5750600381019182549485156105dc57610a30965f60029555600360ff198093161790556010830190815460ff8116610a43575b505050604051908582527fd844fd8b373159eda45a6feb2d1a56218bc5b81cf9936c6dc530e5aafb0f65bf60203393a3015416611b81565b60015f80516020611c1f83398151915255005b1690558680806109f8565b6044906040519063a70b077f60e01b82524260048301526024820152fd5b34610136576020366003190112610136576004355f81815260036020526040902060018101546002909101546001600160a01b0391821633141590821681610c2d575b5061084a57610abc611b52565b815f52600360205260405f2091610ad5600c8401611a36565b90608082015115610c1b57828251163314610c09576060820151804211610beb57506003840190815491602084019280610b1760408651970196875190611ae5565b03610bbf57505f90556010850160ff199081815416905560056008870191825416179055815190835160405192835260208301527f95cb956b7fff155b7675968d6baf1df90813f0694f911536bc512a80ccdb7a1660403393a35180610ba9575b50519081610b935760015f80516020611c1f83398151915255005b6001610ba193015416611b81565b808080610a30565b610bb99083600286015416611b81565b83610b78565b604490610bd0868651905190611ae5565b9060405191633b99c0cb60e21b835260048301526024820152fd5b60449060405190637353d41160e11b82524260048301526024820152fd5b604051635ed5062760e11b8152600490fd5b60405163a8ddbcb360e01b8152600490fd5b905033141583610aaf565b3461013657602080600319360112610136576001600160a01b03610c5a611806565b165f52600560205260405f20906040519081602084549182815201935f5260205f20915f905b828210610c97576109278561091b81890382611972565b835486529485019460019384019390910190610c80565b34610136575f366003190112610136575f546040516001600160a01b039091168152602090f35b34610136576020366003190112610136576004355f52600360205260405f208054600160a01b600190039081600184015416916002840154169260038101549160048201549060058301549060068401546007850154600886015460ff169160098701610d4190611994565b94610d4e600a8901611994565b96610d5b600b8a01611994565b98600c01610d6890611a36565b996040519c8d9c8d6102209981526020015260408d015260608c015260808b015260a08a015260c089015260e08801526101008701610da69161181c565b806101208701528501610db891611829565b848103610140860152610dca91611829565b838103610160850152610ddc91611829565b90610180830161092791611867565b34610136575f36600319011261013657610e03611bf3565b5f80546001600160a01b0319811682556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b3461013657610e50366118cd565b9190815f52600360205260405f2060018060a01b0360028160018401541692015416903314159081610f3e575b5061084a57815f52600360205260405f20600881019081549160ff831660078110156108365760048114610f2c57600181141580610f21575b61080b575060ff19928316600417905560100180547f1b84372106d77c6daea0dda35bbc0229d10a83f58ec899092884925193682341936107269390929160ff8116610f16575b5050506040519182916020835233966020840191611af2565b169055858080610efd565b506002811415610eb6565b604051633fe2486d60e11b8152600490fd5b905033141584610e7d565b346101365760603660031901126101365760025460043590604435906001600160a01b0390602435908216330361084a57610f82611b52565b835f52600360205260405f20936008850180549060ff82166007811015610836576004810361080b575060038701805480610fbd8988611ae5565b0361105757505f9055600560ff198093161790556010860190815460ff811661104c575b505050604051908282528460208301527f5bbfc37a6f395570449ddbe2c9147a0830640899e7736be39a8b8520cf2b55a960403393a380611036575b5081610b935760015f80516020611c1f83398151915255005b6110469082600286015416611b81565b8361101d565b169055858080610fe1565b604490610bd08988611ae5565b34610136576020366003190112610136576004355f818152600360205260409020600101546001600160a01b03908116330361084a576110a2611b52565b815f52600360205260405f2090600882019283549260ff84166007811015610836576002810361080b5750600381019182549485156105dc57610a30965f60029555600360ff198093161790556010830190815460ff8116611137575b505050604051908582527f64b4416fce27e7ac6fa5ad9c2d28a78d2a024b8d2b50a61f18f5e11398f7dd8460203393a3015416611b81565b1690558680806110ff565b34610136576080366003190112610136576004356024359060443560643590825f52600360205260405f2060018060a01b03600281600184015416920154169033141590816112c6575b5061084a57825f52600360205260405f209160ff60088401541660078110158061083657600182141590816112b9575b816112a8575b5061080b57506111d28286611ae5565b600384015480910361129b5750610e108110801561128f575b6105ca576111fb60109142611ae5565b926001608060405161120c81611956565b3381528860208201528560408201528660608201520152600c8101336001600160601b0360a01b82541617905585600d82015582600e82015583600f82015501600160ff19825416179055604051938452602084015260408301527f606c1a7e0e6b5101fb5a4f8e15fa561860ef37f61e4bd2ea8351d3c426e31cfb60603393a3005b5062278d0081116111eb565b604490610bd08488611ae5565b9050610836576004811415876111c2565b505060028114155f6111bc565b90503314158561118c565b34610136576020366003190112610136576040516112ee81611939565b5f81525f60208201525f60408201525f60608201525f60808201525f60a08201525f60c08201525f60e08201525f610100820152606061012082015260606101408201526060610160820152610180611345611abb565b9101526004355f52600360205260405f206040519061136382611939565b8054825260018101546001600160a01b03908116602084015260028201541660408301526003810154606083015260048101546080830152600581015460a0830152600681015460c083015260078082015460e0840152600882015460ff16908110156108365761141391600c916101008501526113e360098201611994565b6101208501526113f5600a8201611994565b610140850152611407600b8201611994565b61016085015201611a36565b6101808201526040518091602082528051602083015260018060a01b03602082015116604083015260018060a01b03604082015116606083015260608101516080830152608081015160a083015260a081015160c083015260c081015160e083015260e081015161010083015261149461010082015161012084019061181c565b6109276101806114ed6114ba610120850151610220610140880152610240870190611829565b6114d861014086015191601f199283898303016101608a0152611829565b90610160860151908783030184880152611829565b9201516101a0840190611867565b3461013657602036600319011261013657611514611806565b5f546001600160a01b039190821633141580611574575b61084a57811690811561060057600254826001600160601b0360a01b821617600255167ff0077b1d49976ecd154f8efdc46cca625489710840b8995fb53d9efa037353ba5f80a3005b50816002541633141561152b565b34610136576020366003190112610136576004355f818152600360205260409020600201546001600160a01b0316330361084a57805f526003602052600860405f2001805460ff81166007811015610836578061080b575060ff1916600117905533907fc8717b61398fb9d7cacf49fe1e296b2f10e9711226b532842b6ffd642cb6a2c65f80a3005b34610136576020366003190112610136576004355f81815260036020526040902060018101546002909101546001600160a01b03918216331415908216816116c3575b5061084a57815f52600360205260405f2090601082019182549160ff831615610c1b57600c8201541633141590816116b4575b5061084a5760ff1916905533907fe4836c0fe44bfa84cc96659a0c624c0957ad662b4a30c8ea31d6141a2199bbba5f80a3005b600f9150015442111584611681565b90503314158361164e565b34610136576020366003190112610136576004355f8181526003602052604090206001015490916001600160a01b0391821633036117f8575061170f611b52565b815f52600360205260405f2090600882019283549260ff8416600781101561083657806117ad575b50600381019182549485156105dc57610a30965f60019555600660ff198093161790556010830190815460ff81166117a2575b505050604051908582527f06f63d695245e4cf8f0b7aae0b8da95876a4b173ba8d0d4466cc83c357dda3a860203393a3015416611b81565b16905586808061176a565b6001036117e6576005810154804211156117c8575085611737565b6044906040519063408b57fb60e01b82524260048301526024820152fd5b604051630ed0000b60e11b8152600490fd5b6282b42960e81b8152600490fd5b600435906001600160a01b038216820361013657565b9060078210156108365752565b91908251928382525f5b848110611853575050825f602080949584010152601f8019910116010190565b602081830181015184830182015201611833565b80516001600160a01b031682526020808201519083015260408082015190830152606080820151908301526080908101511515910152565b9181601f840112156101365782359167ffffffffffffffff8311610136576020838186019501011161013657565b90604060031983011261013657600435916024359067ffffffffffffffff8211610136576118fd9160040161189f565b9091565b90600182811c9216801561192f575b602083101461191b57565b634e487b7160e01b5f52602260045260245ffd5b91607f1691611910565b6101a0810190811067ffffffffffffffff8211176104e957604052565b60a0810190811067ffffffffffffffff8211176104e957604052565b90601f8019910116810190811067ffffffffffffffff8211176104e957604052565b9060405191825f82546119a681611901565b908184526020946001916001811690815f14611a1457506001146119d6575b5050506119d492500383611972565b565b5f90815285812095935091905b8183106119fc5750506119d493508201015f80806119c5565b855488840185015294850194879450918301916119e3565b925050506119d494925060ff191682840152151560051b8201015f80806119c5565b90604051611a4381611956565b82546001600160a01b0316815260018301546020820152600283015460408201526003830154606082015260049092015460ff1615156080830152565b60209060206040818301928281528551809452019301915f5b828110611aa7575050505090565b835185529381019392810192600101611a99565b60405190611ac882611956565b5f6080838281528260208201528260408201528260608201520152565b919082018092116105b657565b908060209392818452848401375f828201840152601f01601f1916010190565b805490680100000000000000008210156104e95760018201808255821015611b3e575f5260205f200155565b634e487b7160e01b5f52603260045260245ffd5b5f80516020611c1f8339815191526002815414611b6f5760029055565b604051633ee5aeb560e01b8152600490fd5b6001600160a01b0316905f90819081908190855af13d15611bee573d67ffffffffffffffff81116104e95760405190611bc4601f8201601f191660200183611972565b81525f60203d92013e5b15611bd65750565b60249060405190630e4c403160e11b82526004820152fd5b611bce565b5f546001600160a01b03163303611c0657565b60405163118cdaa760e01b8152336004820152602490fdfe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a2646970667358221220cafe97137d12325ee36f08c311f5060fdab5271b42154bb73ff52dc8ed44db2964736f6c63430008180033";
