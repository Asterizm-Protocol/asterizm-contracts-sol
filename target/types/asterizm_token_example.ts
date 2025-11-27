/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/asterizm_token_example.json`.
 */
export type AsterizmTokenExample = {
  "address": "ASWxijC9aT8vjBHm91AED6BjEEeZC5oSRVXwcSTgkd3s",
  "metadata": {
    "name": "asterizmTokenExample",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addMeta",
      "discriminator": [
        98,
        4,
        232,
        132,
        215,
        202,
        101,
        231
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
                "path": "tokenName"
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "tokenName"
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
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "metadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "tokenMetadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "metadataProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "metadataProgram"
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "instructionSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenName",
          "type": "string"
        },
        {
          "name": "mintBump",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
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
      "name": "createMint",
      "discriminator": [
        69,
        44,
        215,
        132,
        253,
        214,
        41,
        45
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
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
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
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
          "name": "decimals",
          "type": "u8"
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
        },
        {
          "name": "ownerFeeRate",
          "type": "u64"
        },
        {
          "name": "systemFeeRate",
          "type": "u64"
        },
        {
          "name": "systemFeeAddress",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "mintToUser",
      "discriminator": [
        75,
        194,
        44,
        77,
        10,
        65,
        232,
        85
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
        },
        {
          "name": "ownerTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "token_client_account.authority",
                "account": "tokenClientAccount"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemFeeTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "token_client_account.system_fee_address",
                "account": "tokenClientAccount"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
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
          "name": "mint",
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
                  109,
                  105,
                  110,
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
        },
        {
          "name": "ownerTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "token_client_account.authority",
                "account": "tokenClientAccount"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemFeeTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "token_client_account.system_fee_address",
                "account": "tokenClientAccount"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
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
      "name": "updateClientParams",
      "discriminator": [
        143,
        26,
        80,
        124,
        198,
        104,
        101,
        128
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
          "name": "clientProgramSettings"
        },
        {
          "name": "clientAccount",
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
            "name": "ownerFeeRate",
            "type": "u64"
          },
          {
            "name": "systemFeeRate",
            "type": "u64"
          },
          {
            "name": "systemFeeAddress",
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
