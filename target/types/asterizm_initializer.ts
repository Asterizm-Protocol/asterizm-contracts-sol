/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/asterizm_initializer.json`.
 */
export type AsterizmInitializer = {
  "address": "AS8bAxBaWmxdPfigyeo3T6Lua9u68UtGFLWnYRrzG5tQ",
  "metadata": {
    "name": "asterizmInitializer",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Asterizm initializer"
  },
  "instructions": [
    {
      "name": "blockAccount",
      "discriminator": [
        211,
        224,
        222,
        101,
        90,
        246,
        174,
        47
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
          "name": "blockedAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  111,
                  99,
                  107,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "chainId"
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
          "name": "chainId",
          "type": "u64"
        },
        {
          "name": "userAddress",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initTransfer",
      "discriminator": [
        174,
        50,
        134,
        99,
        122,
        243,
        243,
        224
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
          "name": "dstAccount",
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
          "name": "blockedSrcAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  111,
                  99,
                  107,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "srcChainId"
              },
              {
                "kind": "arg",
                "path": "srcAddress"
              }
            ]
          }
        },
        {
          "name": "blockedDstAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  111,
                  99,
                  107,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "settings_account.local_chain_id",
                "account": "initializerSettings"
              },
              {
                "kind": "arg",
                "path": "dstAddress"
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
        },
        {
          "name": "clientProgram",
          "address": "AS3bpxoN9oWBZ1MusjZKQr9WjuTbG3T3W5fk521wNgb7"
        },
        {
          "name": "clientAccount"
        },
        {
          "name": "clientTransferAccount",
          "writable": true
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
          "name": "relayerSettingsAccount",
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
            ],
            "program": {
              "kind": "account",
              "path": "relayerProgram"
            }
          }
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
                "path": "srcAddress"
              },
              {
                "kind": "arg",
                "path": "transferHash"
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
          "name": "relayOwner",
          "type": "pubkey"
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
          "name": "relayerSettingsAccount",
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
            ],
            "program": {
              "kind": "account",
              "path": "relayerProgram"
            }
          }
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "blockedSrcAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  111,
                  99,
                  107,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "settings_account.local_chain_id",
                "account": "initializerSettings"
              },
              {
                "kind": "arg",
                "path": "srcAddress"
              }
            ]
          }
        },
        {
          "name": "blockedDstAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  111,
                  99,
                  107,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "dstChainId"
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
                "path": "srcAddress"
              },
              {
                "kind": "arg",
                "path": "transferHash"
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
          "name": "relayOwner",
          "type": "pubkey"
        },
        {
          "name": "dstChainId",
          "type": "u64"
        },
        {
          "name": "srcAddress",
          "type": "pubkey"
        },
        {
          "name": "dstAddress",
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
        },
        {
          "name": "transferResultNotifyFlag",
          "type": "bool"
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
          "name": "clientProgram",
          "address": "AS3bpxoN9oWBZ1MusjZKQr9WjuTbG3T3W5fk521wNgb7"
        },
        {
          "name": "clientAccount"
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
      "name": "unblockAccount",
      "discriminator": [
        6,
        27,
        18,
        22,
        208,
        252,
        21,
        71
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
          "name": "blockedAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  111,
                  99,
                  107,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "chainId"
              },
              {
                "kind": "arg",
                "path": "userAddress"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "chainId",
          "type": "u64"
        },
        {
          "name": "userAddress",
          "type": "pubkey"
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
          "address": "AS8bAxBaWmxdPfigyeo3T6Lua9u68UtGFLWnYRrzG5tQ"
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
      "name": "blockedAccount",
      "discriminator": [
        227,
        209,
        198,
        155,
        99,
        193,
        183,
        55
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
      "name": "blockAccountEvent",
      "discriminator": [
        215,
        1,
        231,
        120,
        127,
        157,
        225,
        33
      ]
    },
    {
      "name": "createInitializerSettingsEvent",
      "discriminator": [
        117,
        195,
        18,
        144,
        247,
        120,
        233,
        252
      ]
    },
    {
      "name": "incomingEvent",
      "discriminator": [
        148,
        113,
        227,
        250,
        219,
        186,
        254,
        100
      ]
    },
    {
      "name": "outgoingEvent",
      "discriminator": [
        252,
        77,
        129,
        59,
        51,
        246,
        60,
        244
      ]
    },
    {
      "name": "updateInitializerSettingsEvent",
      "discriminator": [
        246,
        102,
        229,
        50,
        69,
        173,
        107,
        230
      ]
    }
  ],
  "types": [
    {
      "name": "blockAccountEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "chainId",
            "type": "u64"
          },
          {
            "name": "userAddress",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "blockedAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isBlocked",
            "type": "bool"
          },
          {
            "name": "chainId",
            "type": "u64"
          },
          {
            "name": "userAddress",
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
      "name": "createInitializerSettingsEvent",
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
      "name": "incomingEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
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
      "name": "outgoingEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
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
            "name": "exists",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "updateInitializerSettingsEvent",
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
