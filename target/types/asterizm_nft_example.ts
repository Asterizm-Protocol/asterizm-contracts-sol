/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/asterizm_nft_example.json`.
 */
export type AsterizmNftExample = {
  "address": "ASPAGH1992btTDvmLELAWAAzj9J5tLyaDHdW4qaYxsnG",
  "metadata": {
    "name": "asterizmNftExample",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "burn",
      "discriminator": [
        116,
        110,
        29,
        56,
        107,
        219,
        42,
        93
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "nftClientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "nft_client_account.authority",
                "account": "nftClientAccount"
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
                  110,
                  102,
                  116,
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
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
          "name": "metadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "nftMetadata",
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
          "name": "masterEditionAccount",
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
              },
              {
                "kind": "const",
                "value": [
                  101,
                  100,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
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
          "name": "instructionSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nftId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "dstChainId",
          "type": "u64"
        },
        {
          "name": "dstAddress",
          "type": "pubkey"
        },
        {
          "name": "uri",
          "type": "string"
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
          "name": "nftClientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
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
                  110,
                  102,
                  116,
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
          "name": "nftClientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
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
                  110,
                  102,
                  116,
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
      "name": "createNft",
      "discriminator": [
        231,
        119,
        61,
        97,
        217,
        46,
        142,
        109
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
          "signer": true
        },
        {
          "name": "nftDataAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "transferHash"
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
                  110,
                  102,
                  116,
                  45,
                  100,
                  97,
                  116,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "nftClientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "nft_client_account.authority",
                "account": "nftClientAccount"
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
                  110,
                  102,
                  116,
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
          "name": "to"
        },
        {
          "name": "tokenAccount",
          "writable": true
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "metadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "masterEditionAccount",
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
              },
              {
                "kind": "const",
                "value": [
                  101,
                  100,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "metadataProgram"
            }
          }
        },
        {
          "name": "nftMetadata",
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
          "name": "instructionSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
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
      "name": "createNftClient",
      "discriminator": [
        75,
        225,
        236,
        58,
        76,
        197,
        100,
        69
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "nftClientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
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
                  110,
                  102,
                  116,
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
      "name": "mintNft",
      "discriminator": [
        211,
        57,
        6,
        167,
        15,
        219,
        35,
        251
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
          "signer": true
        },
        {
          "name": "nftClientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
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
                  110,
                  102,
                  116,
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
          "name": "to"
        },
        {
          "name": "tokenAccount",
          "writable": true
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "metadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "masterEditionAccount",
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
              },
              {
                "kind": "const",
                "value": [
                  101,
                  100,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "metadataProgram"
            }
          }
        },
        {
          "name": "nftMetadata",
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
          "name": "instructionSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
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
          "name": "nftDataAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "transferHash"
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
                  110,
                  102,
                  116,
                  45,
                  100,
                  97,
                  116,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "nftClientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "nft_client_account.authority",
                "account": "nftClientAccount"
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
                  110,
                  102,
                  116,
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
          "name": "clientProgram"
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
          "name": "clientSender"
        },
        {
          "name": "chainAccount"
        },
        {
          "name": "relayerProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
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
          "name": "srcAccount",
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
          "name": "payload",
          "type": "bytes"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
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
          "name": "nftClientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
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
                  110,
                  102,
                  116,
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
          "name": "nftClientAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
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
                  110,
                  102,
                  116,
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
          "name": "chainId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateNft",
      "discriminator": [
        97,
        5,
        62,
        85,
        23,
        92,
        96,
        25
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "nftDataAccount",
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "transferHash"
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
                  110,
                  102,
                  116,
                  45,
                  100,
                  97,
                  116,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "nftClientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "nft_client_account.authority",
                "account": "nftClientAccount"
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
                  110,
                  102,
                  116,
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
          "name": "to"
        },
        {
          "name": "metadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "nftMetadata",
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
      "name": "updateNftClient",
      "discriminator": [
        42,
        49,
        184,
        8,
        114,
        27,
        100,
        155
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "nftClientAccount",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
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
                  110,
                  102,
                  116,
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
      "name": "nftClientAccount",
      "discriminator": [
        62,
        31,
        55,
        49,
        207,
        255,
        75,
        63
      ]
    },
    {
      "name": "nftDataAccount",
      "discriminator": [
        233,
        157,
        103,
        70,
        150,
        67,
        224,
        228
      ]
    }
  ],
  "types": [
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
      "name": "nftClientAccount",
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
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "nftDataAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "uri",
            "type": "string"
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
            "name": "dstAddress",
            "type": "pubkey"
          },
          {
            "name": "isUsed",
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
