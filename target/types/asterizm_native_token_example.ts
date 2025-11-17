/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/asterizm_native_token_example.json`.
 */
export type AsterizmNativeTokenExample = {
  "address": "ASzKeKfU6HM6NZHdmuQL31uvU1Hw8Foj8y6Myky6Wp47",
  "metadata": {
    "name": "asterizmNativeTokenExample",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
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
          "name": "tokenAuthority",
          "writable": true
        },
        {
          "name": "tokenClientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "tokenAuthority"
              },
              {
                "kind": "arg",
                "path": "name"
              },
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  116,
                  101,
                  114,
                  105,
                  122,
                  109,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "clientProgram",
          "address": "AS3bpxoN9oWBZ1MusjZKQr9WjuTbG3T3W5fk521wNgb7"
        },
        {
          "name": "clientAccount",
          "writable": true
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
                "kind": "account",
                "path": "tokenClientAccount"
              },
              {
                "kind": "arg",
                "path": "transferHash"
              }
            ],
            "program": {
              "kind": "account",
              "path": "clientProgram"
            }
          }
        },
        {
          "name": "refundTransferAccount",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "tokenAuthority"
              },
              {
                "kind": "arg",
                "path": "transferHash"
              },
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  117,
                  110,
                  100,
                  45,
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "clientRefundAccount",
          "writable": true
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
          "name": "name",
          "type": "string"
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
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenClientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "name"
              },
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  116,
                  101,
                  114,
                  105,
                  122,
                  109,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "clientAccount"
        },
        {
          "name": "sender",
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
          "name": "clientProgram",
          "address": "AS3bpxoN9oWBZ1MusjZKQr9WjuTbG3T3W5fk521wNgb7"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
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
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenClientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "name"
              },
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  116,
                  101,
                  114,
                  105,
                  122,
                  109,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "clientAccount"
        },
        {
          "name": "trustedAddress",
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
          "name": "clientProgram",
          "address": "AS3bpxoN9oWBZ1MusjZKQr9WjuTbG3T3W5fk521wNgb7"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
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
      "name": "createVault",
      "discriminator": [
        29,
        237,
        247,
        208,
        193,
        82,
        54,
        135
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenClientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "name"
              },
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  116,
                  101,
                  114,
                  105,
                  122,
                  109,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "name"
              },
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  116,
                  101,
                  114,
                  105,
                  122,
                  109,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "clientProgramSettings"
        },
        {
          "name": "clientAccount",
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
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "clientProgram",
          "address": "AS3bpxoN9oWBZ1MusjZKQr9WjuTbG3T3W5fk521wNgb7"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
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
          "name": "fee",
          "type": "u64"
        },
        {
          "name": "refundFee",
          "type": "u64"
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
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenAuthority",
          "writable": true
        },
        {
          "name": "tokenClientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "tokenAuthority"
              },
              {
                "kind": "arg",
                "path": "name"
              },
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  116,
                  101,
                  114,
                  105,
                  122,
                  109,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "token_client_account.authority",
                "account": "tokenClientAccount"
              },
              {
                "kind": "arg",
                "path": "name"
              },
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  116,
                  101,
                  114,
                  105,
                  122,
                  109,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "to"
        },
        {
          "name": "tokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "clientProgram",
          "address": "AS3bpxoN9oWBZ1MusjZKQr9WjuTbG3T3W5fk521wNgb7"
        },
        {
          "name": "clientAccount"
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
                "kind": "account",
                "path": "tokenClientAccount"
              },
              {
                "kind": "arg",
                "path": "transferHash"
              }
            ],
            "program": {
              "kind": "account",
              "path": "clientProgram"
            }
          }
        },
        {
          "name": "refundTransferAccount",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "tokenAuthority"
              },
              {
                "kind": "arg",
                "path": "transferHash"
              },
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  117,
                  110,
                  100,
                  45,
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "clientRefundAccount",
          "writable": true
        },
        {
          "name": "clientSender"
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
          "name": "name",
          "type": "string"
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
          "name": "tokenClientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "token_client_account.authority",
                "account": "tokenClientAccount"
              },
              {
                "kind": "arg",
                "path": "name"
              },
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  116,
                  101,
                  114,
                  105,
                  122,
                  109,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "token_client_account.authority",
                "account": "tokenClientAccount"
              },
              {
                "kind": "arg",
                "path": "name"
              },
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  116,
                  101,
                  114,
                  105,
                  122,
                  109,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "to"
        },
        {
          "name": "tokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "clientProgram",
          "address": "AS3bpxoN9oWBZ1MusjZKQr9WjuTbG3T3W5fk521wNgb7"
        },
        {
          "name": "clientSettingsAccount"
        },
        {
          "name": "clientAccount",
          "writable": true
        },
        {
          "name": "transferAccount",
          "writable": true
        },
        {
          "name": "clientTrustedAddress"
        },
        {
          "name": "clientSender"
        },
        {
          "name": "chainAccount"
        },
        {
          "name": "relayerProgram"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
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
          "name": "tokenClientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "name"
              },
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  116,
                  101,
                  114,
                  105,
                  122,
                  109,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "clientAccount"
        },
        {
          "name": "sender",
          "writable": true
        },
        {
          "name": "clientProgram",
          "address": "AS3bpxoN9oWBZ1MusjZKQr9WjuTbG3T3W5fk521wNgb7"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
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
          "name": "tokenClientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "name"
              },
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  116,
                  101,
                  114,
                  105,
                  122,
                  109,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "clientAccount"
        },
        {
          "name": "trustedAddress",
          "writable": true
        },
        {
          "name": "clientProgram",
          "address": "AS3bpxoN9oWBZ1MusjZKQr9WjuTbG3T3W5fk521wNgb7"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "chainId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sendFromVault",
      "discriminator": [
        92,
        113,
        120,
        93,
        5,
        200,
        201,
        6
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenClientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "name"
              },
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  116,
                  101,
                  114,
                  105,
                  122,
                  109,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "tokenAccount",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "name"
              },
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  116,
                  101,
                  114,
                  105,
                  122,
                  109,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "amount",
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
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenAuthority",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "tokenAuthority"
              },
              {
                "kind": "arg",
                "path": "name"
              },
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  116,
                  101,
                  114,
                  105,
                  122,
                  109,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "from",
          "writable": true
        },
        {
          "name": "tokenClientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "tokenAuthority"
              },
              {
                "kind": "arg",
                "path": "name"
              },
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  116,
                  101,
                  114,
                  105,
                  122,
                  109,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "refundTransferAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "tokenAuthority"
              },
              {
                "kind": "arg",
                "path": "transferHash"
              },
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  117,
                  110,
                  100,
                  45,
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "clientProgram",
          "address": "AS3bpxoN9oWBZ1MusjZKQr9WjuTbG3T3W5fk521wNgb7"
        },
        {
          "name": "clientSettingsAccount"
        },
        {
          "name": "clientAccount",
          "writable": true
        },
        {
          "name": "trustedAddress"
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
          "name": "chainAccount"
        },
        {
          "name": "relayerProgram"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
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
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "dstAddress",
          "type": "pubkey"
        },
        {
          "name": "dstChainId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateFee",
      "discriminator": [
        232,
        253,
        195,
        247,
        148,
        212,
        73,
        222
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenClientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "name"
              },
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  116,
                  101,
                  114,
                  105,
                  122,
                  109,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "fee",
          "type": "u64"
        },
        {
          "name": "refundFee",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
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
      "name": "refundTransferAccount",
      "discriminator": [
        3,
        2,
        74,
        69,
        188,
        158,
        249,
        79
      ]
    },
    {
      "name": "tokenClientAccount",
      "discriminator": [
        205,
        169,
        94,
        237,
        217,
        163,
        137,
        225
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
      "name": "addTransferEvent",
      "discriminator": [
        20,
        180,
        60,
        142,
        229,
        241,
        158,
        92
      ]
    }
  ],
  "types": [
    {
      "name": "addTransferEvent",
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
          },
          {
            "name": "userAddress",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "tokenAddress",
            "type": "pubkey"
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
      "name": "refundTransferAccount",
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
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "tokenAddress",
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
      "name": "tokenClientAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "txId",
            "type": "u128"
          },
          {
            "name": "fee",
            "type": "u64"
          },
          {
            "name": "refundFee",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
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
    }
  ]
};
