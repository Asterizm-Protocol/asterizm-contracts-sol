/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/asterizm_client.json`.
 */
export type AsterizmClient = {
  "address": "AS3bpxoN9oWBZ1MusjZKQr9WjuTbG3T3W5fk521wNgb7",
  "metadata": {
    "name": "asterizmClient",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Asterizm client"
  },
  "instructions": [
    {
      "name": "addRefundRequest",
      "discriminator": [
        13,
        38,
        189,
        91,
        62,
        11,
        64,
        40
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "clientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              }
            ]
          }
        },
        {
          "name": "transferAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  117,
                  116,
                  103,
                  111,
                  105,
                  110,
                  103,
                  95,
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              },
              {
                "kind": "arg",
                "path": "transferHash"
              }
            ]
          }
        },
        {
          "name": "refundAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              },
              {
                "kind": "arg",
                "path": "transferHash"
              }
            ]
          }
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "userAddress",
          "type": "pubkey"
        },
        {
          "name": "transferHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "confirmIncomingRefund",
      "discriminator": [
        203,
        47,
        207,
        235,
        160,
        198,
        44,
        155
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "clientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              }
            ]
          }
        },
        {
          "name": "transferAccount",
          "writable": true
        },
        {
          "name": "sender",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  110,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              },
              {
                "kind": "account",
                "path": "sender.address",
                "account": "clientSender"
              }
            ]
          }
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "userAddress",
          "type": "pubkey"
        },
        {
          "name": "transferHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "createClient",
      "discriminator": [
        155,
        165,
        72,
        245,
        11,
        206,
        91,
        141
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "settingsAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "clientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              }
            ]
          }
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "userAddress",
          "type": "pubkey"
        },
        {
          "name": "relayOwner",
          "type": "pubkey"
        },
        {
          "name": "notifyTransferSendingResult",
          "type": "bool"
        },
        {
          "name": "disableHashValidation",
          "type": "bool"
        },
        {
          "name": "refundEnabled",
          "type": "bool"
        }
      ]
    },
    {
      "name": "createClientSender",
      "discriminator": [
        68,
        179,
        143,
        232,
        201,
        238,
        47,
        55
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "clientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              }
            ]
          }
        },
        {
          "name": "sender",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  110,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              },
              {
                "kind": "arg",
                "path": "address"
              }
            ]
          }
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "userAddress",
          "type": "pubkey"
        },
        {
          "name": "address",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "createClientTrustedAddress",
      "discriminator": [
        243,
        200,
        241,
        26,
        56,
        11,
        126,
        173
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "clientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              }
            ]
          }
        },
        {
          "name": "trustedAddress",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  117,
                  115,
                  116,
                  101,
                  100,
                  95,
                  97,
                  100,
                  100,
                  114,
                  101,
                  115,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              },
              {
                "kind": "arg",
                "path": "chainId"
              }
            ]
          }
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "userAddress",
          "type": "pubkey"
        },
        {
          "name": "chainId",
          "type": "u64"
        },
        {
          "name": "address",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initReceiveMessage",
      "discriminator": [
        108,
        22,
        232,
        21,
        139,
        159,
        12,
        23
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "clientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "dstAddress"
              }
            ]
          }
        },
        {
          "name": "transferAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "instructionSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "dstAddress",
          "type": "pubkey"
        },
        {
          "name": "srcAddress",
          "type": "pubkey"
        },
        {
          "name": "srcChainId",
          "type": "u64"
        },
        {
          "name": "txId",
          "type": "u128"
        },
        {
          "name": "transferHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "initSendMessage",
      "discriminator": [
        35,
        125,
        7,
        15,
        30,
        89,
        137,
        5
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "settingsAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "clientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              }
            ]
          }
        },
        {
          "name": "trustedAddress",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  117,
                  115,
                  116,
                  101,
                  100,
                  95,
                  97,
                  100,
                  100,
                  114,
                  101,
                  115,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              },
              {
                "kind": "arg",
                "path": "dstChainId"
              }
            ]
          }
        },
        {
          "name": "transferAccount",
          "writable": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "chainAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  105,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "dstChainId"
              }
            ],
            "program": {
              "kind": "account",
              "path": "relayerProgram"
            }
          }
        },
        {
          "name": "relayerProgram",
          "address": "ASYphRUbL2UEdjMQMLm6g2XjU3JfxTikz491TGMuADQk"
        }
      ],
      "args": [
        {
          "name": "userAddress",
          "type": "pubkey"
        },
        {
          "name": "dstChainId",
          "type": "u64"
        },
        {
          "name": "payload",
          "type": "bytes"
        },
        {
          "name": "txId",
          "type": "u128"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "settingsAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "localChainId",
          "type": "u64"
        },
        {
          "name": "manager",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "processRefundRequest",
      "discriminator": [
        104,
        191,
        60,
        221,
        225,
        67,
        60,
        67
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "clientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              }
            ]
          }
        },
        {
          "name": "transferAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  117,
                  116,
                  103,
                  111,
                  105,
                  110,
                  103,
                  95,
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              },
              {
                "kind": "arg",
                "path": "transferHash"
              }
            ]
          }
        },
        {
          "name": "sender",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  110,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              },
              {
                "kind": "account",
                "path": "sender.address",
                "account": "clientSender"
              }
            ]
          }
        },
        {
          "name": "refundAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              },
              {
                "kind": "arg",
                "path": "transferHash"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "userAddress",
          "type": "pubkey"
        },
        {
          "name": "transferHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "status",
          "type": "bool"
        }
      ]
    },
    {
      "name": "receiveMessage",
      "discriminator": [
        38,
        144,
        127,
        225,
        31,
        225,
        238,
        25
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "settingsAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "clientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "dstAddress"
              }
            ]
          }
        },
        {
          "name": "sender",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  110,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "dstAddress"
              },
              {
                "kind": "account",
                "path": "sender.address",
                "account": "clientSender"
              }
            ]
          }
        },
        {
          "name": "trustedAddress",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  117,
                  115,
                  116,
                  101,
                  100,
                  95,
                  97,
                  100,
                  100,
                  114,
                  101,
                  115,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "dstAddress"
              },
              {
                "kind": "arg",
                "path": "srcChainId"
              }
            ]
          }
        },
        {
          "name": "transferAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  99,
                  111,
                  109,
                  105,
                  110,
                  103,
                  95,
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "dstAddress"
              },
              {
                "kind": "arg",
                "path": "transferHash"
              }
            ]
          }
        },
        {
          "name": "chainAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  105,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "srcChainId"
              }
            ],
            "program": {
              "kind": "account",
              "path": "relayerProgram"
            }
          }
        },
        {
          "name": "relayerProgram",
          "address": "ASYphRUbL2UEdjMQMLm6g2XjU3JfxTikz491TGMuADQk"
        }
      ],
      "args": [
        {
          "name": "dstAddress",
          "type": "pubkey"
        },
        {
          "name": "txId",
          "type": "u128"
        },
        {
          "name": "srcChainId",
          "type": "u64"
        },
        {
          "name": "srcAddress",
          "type": "pubkey"
        },
        {
          "name": "transferHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "payload",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "removeClientSender",
      "discriminator": [
        47,
        194,
        10,
        63,
        132,
        240,
        66,
        8
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "clientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              }
            ]
          }
        },
        {
          "name": "sender",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  110,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              },
              {
                "kind": "arg",
                "path": "address"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "userAddress",
          "type": "pubkey"
        },
        {
          "name": "address",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "removeClientTrustedAddress",
      "discriminator": [
        207,
        21,
        182,
        212,
        124,
        193,
        130,
        202
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "clientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              }
            ]
          }
        },
        {
          "name": "trustedAddress",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  117,
                  115,
                  116,
                  101,
                  100,
                  95,
                  97,
                  100,
                  100,
                  114,
                  101,
                  115,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              },
              {
                "kind": "arg",
                "path": "chainId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "userAddress",
          "type": "pubkey"
        },
        {
          "name": "chainId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "resendMessage",
      "discriminator": [
        62,
        74,
        77,
        0,
        50,
        33,
        223,
        126
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "clientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              }
            ]
          }
        },
        {
          "name": "sender",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  110,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              },
              {
                "kind": "account",
                "path": "sender.address",
                "account": "clientSender"
              }
            ]
          }
        },
        {
          "name": "transferAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  117,
                  116,
                  103,
                  111,
                  105,
                  110,
                  103,
                  95,
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              },
              {
                "kind": "arg",
                "path": "transferHash"
              }
            ]
          }
        },
        {
          "name": "initializerSettingsAccount"
        },
        {
          "name": "relayerSettingsAccount"
        },
        {
          "name": "systemRelayAccountOwner",
          "writable": true
        },
        {
          "name": "relayAccount"
        },
        {
          "name": "relayAccountOwner",
          "writable": true,
          "optional": true
        },
        {
          "name": "relayerProgram",
          "address": "ASYphRUbL2UEdjMQMLm6g2XjU3JfxTikz491TGMuADQk"
        },
        {
          "name": "initializerProgram",
          "address": "AS8bAxBaWmxdPfigyeo3T6Lua9u68UtGFLWnYRrzG5tQ"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "initializerTransferAccount"
        },
        {
          "name": "instructionSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "userAddress",
          "type": "pubkey"
        },
        {
          "name": "transferHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "value",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sendMessage",
      "discriminator": [
        57,
        40,
        34,
        178,
        189,
        10,
        65,
        26
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "clientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              }
            ]
          }
        },
        {
          "name": "trustedAddress",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  117,
                  115,
                  116,
                  101,
                  100,
                  95,
                  97,
                  100,
                  100,
                  114,
                  101,
                  115,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              },
              {
                "kind": "arg",
                "path": "dstChainId"
              }
            ]
          }
        },
        {
          "name": "sender",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  110,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              },
              {
                "kind": "account",
                "path": "sender.address",
                "account": "clientSender"
              }
            ]
          }
        },
        {
          "name": "transferAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  117,
                  116,
                  103,
                  111,
                  105,
                  110,
                  103,
                  95,
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              },
              {
                "kind": "arg",
                "path": "transferHash"
              }
            ]
          }
        },
        {
          "name": "initializerSettingsAccount"
        },
        {
          "name": "relayerSettingsAccount"
        },
        {
          "name": "systemRelayAccountOwner",
          "writable": true
        },
        {
          "name": "relayAccount"
        },
        {
          "name": "relayAccountOwner",
          "writable": true,
          "optional": true
        },
        {
          "name": "chainAccount"
        },
        {
          "name": "relayerProgram",
          "address": "ASYphRUbL2UEdjMQMLm6g2XjU3JfxTikz491TGMuADQk"
        },
        {
          "name": "initializerProgram",
          "address": "AS8bAxBaWmxdPfigyeo3T6Lua9u68UtGFLWnYRrzG5tQ"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "blockedSrcAccount"
        },
        {
          "name": "blockedDstAccount"
        },
        {
          "name": "initializerTransferAccount",
          "writable": true
        },
        {
          "name": "instructionSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "userAddress",
          "type": "pubkey"
        },
        {
          "name": "dstChainId",
          "type": "u64"
        },
        {
          "name": "txId",
          "type": "u128"
        },
        {
          "name": "transferHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "value",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferSendingResult",
      "discriminator": [
        7,
        175,
        233,
        73,
        106,
        136,
        204,
        168
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "clientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "dstAddress"
              }
            ]
          }
        },
        {
          "name": "instructionSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "dstAddress",
          "type": "pubkey"
        },
        {
          "name": "transferHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "statusCode",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateClient",
      "discriminator": [
        184,
        89,
        17,
        76,
        97,
        57,
        165,
        10
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "settingsAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "clientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "userAddress"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "userAddress",
          "type": "pubkey"
        },
        {
          "name": "relayOwner",
          "type": "pubkey"
        },
        {
          "name": "notifyTransferSendingResult",
          "type": "bool"
        },
        {
          "name": "disableHashValidation",
          "type": "bool"
        },
        {
          "name": "refundEnabled",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateSettings",
      "discriminator": [
        81,
        166,
        51,
        213,
        158,
        84,
        157,
        108
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "settingsAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "AS3bpxoN9oWBZ1MusjZKQr9WjuTbG3T3W5fk521wNgb7"
        },
        {
          "name": "programData"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "manager",
          "type": "pubkey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "chain",
      "discriminator": [
        249,
        97,
        81,
        239,
        108,
        208,
        45,
        27
      ]
    },
    {
      "name": "clientAccount",
      "discriminator": [
        26,
        201,
        250,
        54,
        95,
        18,
        189,
        116
      ]
    },
    {
      "name": "clientProgramSettings",
      "discriminator": [
        77,
        75,
        45,
        159,
        216,
        231,
        222,
        115
      ]
    },
    {
      "name": "clientSender",
      "discriminator": [
        252,
        1,
        188,
        100,
        167,
        142,
        226,
        233
      ]
    },
    {
      "name": "clientTrustedAddress",
      "discriminator": [
        225,
        105,
        197,
        233,
        93,
        223,
        5,
        154
      ]
    },
    {
      "name": "initializerSettings",
      "discriminator": [
        108,
        187,
        231,
        24,
        254,
        251,
        223,
        156
      ]
    },
    {
      "name": "refundAccount",
      "discriminator": [
        33,
        196,
        176,
        53,
        44,
        213,
        37,
        99
      ]
    },
    {
      "name": "relayerSettings",
      "discriminator": [
        163,
        153,
        144,
        216,
        27,
        163,
        189,
        82
      ]
    },
    {
      "name": "transferAccount",
      "discriminator": [
        166,
        217,
        148,
        252,
        107,
        104,
        0,
        90
      ]
    }
  ],
  "events": [
    {
      "name": "addRefundRequestEvent",
      "discriminator": [
        193,
        158,
        185,
        78,
        168,
        174,
        161,
        71
      ]
    },
    {
      "name": "clientCreatedEvent",
      "discriminator": [
        47,
        193,
        207,
        128,
        15,
        251,
        55,
        143
      ]
    },
    {
      "name": "clientSenderCreatedEvent",
      "discriminator": [
        214,
        244,
        138,
        39,
        98,
        31,
        142,
        11
      ]
    },
    {
      "name": "clientSenderRemovedEvent",
      "discriminator": [
        21,
        184,
        50,
        17,
        86,
        33,
        26,
        171
      ]
    },
    {
      "name": "clientTrustedAddressCreatedEvent",
      "discriminator": [
        130,
        89,
        119,
        66,
        195,
        231,
        195,
        27
      ]
    },
    {
      "name": "clientTrustedAddressRemovedEvent",
      "discriminator": [
        148,
        9,
        181,
        99,
        241,
        153,
        106,
        101
      ]
    },
    {
      "name": "clientUpdatedEvent",
      "discriminator": [
        153,
        180,
        170,
        210,
        48,
        212,
        204,
        6
      ]
    },
    {
      "name": "createClientSettingsEvent",
      "discriminator": [
        95,
        163,
        29,
        135,
        155,
        117,
        232,
        7
      ]
    },
    {
      "name": "initiateTransferEvent",
      "discriminator": [
        106,
        141,
        153,
        181,
        123,
        122,
        25,
        228
      ]
    },
    {
      "name": "payloadReceivedEvent",
      "discriminator": [
        230,
        63,
        116,
        48,
        88,
        242,
        184,
        84
      ]
    },
    {
      "name": "transferSendingResultEvent",
      "discriminator": [
        129,
        42,
        204,
        90,
        40,
        228,
        247,
        143
      ]
    },
    {
      "name": "updateClientSettingsEvent",
      "discriminator": [
        194,
        179,
        220,
        10,
        207,
        145,
        0,
        200
      ]
    }
  ],
  "types": [
    {
      "name": "addRefundRequestEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "transferHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "chain",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "chainType",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "clientAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "txId",
            "type": "u128"
          },
          {
            "name": "userAddress",
            "type": "pubkey"
          },
          {
            "name": "relayOwner",
            "type": "pubkey"
          },
          {
            "name": "notifyTransferSendingResult",
            "type": "bool"
          },
          {
            "name": "disableHashValidation",
            "type": "bool"
          },
          {
            "name": "refundEnabled",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "clientCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "userAddress",
            "type": "pubkey"
          },
          {
            "name": "relayOwner",
            "type": "pubkey"
          },
          {
            "name": "notifyTransferSendingResult",
            "type": "bool"
          },
          {
            "name": "disableHashValidation",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "clientProgramSettings",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "manager",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "localChainId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "clientSender",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "userAddress",
            "type": "pubkey"
          },
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "clientSenderCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "userAddress",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "clientSenderRemovedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "userAddress",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "clientTrustedAddress",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "userAddress",
            "type": "pubkey"
          },
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "chainId",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "clientTrustedAddressCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "userAddress",
            "type": "pubkey"
          },
          {
            "name": "chainId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "clientTrustedAddressRemovedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userAddress",
            "type": "pubkey"
          },
          {
            "name": "chainId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "clientUpdatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "userAddress",
            "type": "pubkey"
          },
          {
            "name": "relayOwner",
            "type": "pubkey"
          },
          {
            "name": "notifyTransferSendingResult",
            "type": "bool"
          },
          {
            "name": "disableHashValidation",
            "type": "bool"
          },
          {
            "name": "refundEnabled",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "createClientSettingsEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "manager",
            "type": "pubkey"
          },
          {
            "name": "localChainId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "initializerSettings",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "manager",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "localChainId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "initiateTransferEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dstChainId",
            "type": "u64"
          },
          {
            "name": "trustedAddress",
            "type": "pubkey"
          },
          {
            "name": "id",
            "type": "u128"
          },
          {
            "name": "transferHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "payload",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "payloadReceivedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "srcChainId",
            "type": "u64"
          },
          {
            "name": "srcAddress",
            "type": "pubkey"
          },
          {
            "name": "txId",
            "type": "u128"
          },
          {
            "name": "transferHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "refundAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "refundStatus"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "refundStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "canceled"
          },
          {
            "name": "success"
          }
        ]
      }
    },
    {
      "name": "relayerSettings",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "manager",
            "type": "pubkey"
          },
          {
            "name": "systemRelayerOwner",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "localChainId",
            "type": "u64"
          },
          {
            "name": "systemFee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "transferAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "successReceive",
            "type": "bool"
          },
          {
            "name": "successExecute",
            "type": "bool"
          },
          {
            "name": "refunded",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "transferSendingResultEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dstAddress",
            "type": "pubkey"
          },
          {
            "name": "transferHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "statusCode",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "updateClientSettingsEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "manager",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
