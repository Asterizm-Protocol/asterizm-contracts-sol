/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/asterizm_relayer.json`.
 */
export type AsterizmRelayer = {
  "address": "ASYphRUbL2UEdjMQMLm6g2XjU3JfxTikz491TGMuADQk",
  "metadata": {
    "name": "asterizmRelayer",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Asterizm relayer"
  },
  "instructions": [
    {
      "name": "createChain",
      "discriminator": [
        195,
        153,
        135,
        145,
        53,
        110,
        0,
        227
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
          "name": "chainAccount",
          "writable": true,
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
                "path": "id"
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
          "name": "id",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "chainType",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createCustomRelay",
      "discriminator": [
        125,
        29,
        74,
        137,
        26,
        145,
        215,
        216
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
          "name": "relayAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "owner"
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
          "name": "owner",
          "type": "pubkey"
        },
        {
          "name": "fee",
          "type": "u64"
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
          "name": "relayAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "systemRelayerOwner"
              }
            ]
          }
        },
        {
          "name": "chainAccount",
          "writable": true,
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
                "path": "localChainId"
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
          "name": "systemRelayerOwner",
          "type": "pubkey"
        },
        {
          "name": "localChainId",
          "type": "u64"
        },
        {
          "name": "manager",
          "type": "pubkey"
        },
        {
          "name": "systemFee",
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
          "name": "relayAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "relayOwner"
              }
            ]
          }
        },
        {
          "name": "relayAccountOwner",
          "writable": true
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
          "name": "relayAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "relayOwner"
              }
            ]
          }
        },
        {
          "name": "relayAccountOwner",
          "writable": true
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
            ]
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
          "name": "transferResultNotifyFlag",
          "type": "bool"
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
      "name": "transferMessage",
      "discriminator": [
        231,
        100,
        145,
        67,
        219,
        45,
        108,
        96
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
          "name": "relayAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "relayOwner"
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
            ]
          }
        },
        {
          "name": "initializerProgram",
          "address": "AS8bAxBaWmxdPfigyeo3T6Lua9u68UtGFLWnYRrzG5tQ"
        },
        {
          "name": "initializerSettingsAccount",
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
              "path": "initializerProgram"
            }
          }
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
          "name": "dstAccount",
          "writable": true
        },
        {
          "name": "transferAccount",
          "writable": true
        },
        {
          "name": "blockedSrcAccount"
        },
        {
          "name": "blockedDstAccount"
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
          "name": "relayOwner",
          "type": "pubkey"
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
          "name": "relayAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "relayOwner"
              }
            ]
          }
        },
        {
          "name": "initializerProgram",
          "address": "AS8bAxBaWmxdPfigyeo3T6Lua9u68UtGFLWnYRrzG5tQ"
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
          "name": "relayOwner",
          "type": "pubkey"
        },
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
      "name": "updateChainType",
      "discriminator": [
        152,
        218,
        63,
        106,
        133,
        162,
        173,
        121
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
          "name": "chainAccount",
          "writable": true,
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
                "path": "id"
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
          "name": "id",
          "type": "u64"
        },
        {
          "name": "chainType",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateCustomRelay",
      "discriminator": [
        227,
        84,
        231,
        81,
        73,
        167,
        3,
        18
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
          "name": "relayAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "owner",
          "type": "pubkey"
        },
        {
          "name": "fee",
          "type": "u64"
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
          "address": "ASYphRUbL2UEdjMQMLm6g2XjU3JfxTikz491TGMuADQk"
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
        },
        {
          "name": "systemFee",
          "type": "u64"
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
      "name": "customRelayer",
      "discriminator": [
        18,
        39,
        15,
        110,
        139,
        71,
        86,
        240
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
    }
  ],
  "events": [
    {
      "name": "createChainEvent",
      "discriminator": [
        174,
        31,
        206,
        171,
        233,
        104,
        223,
        240
      ]
    },
    {
      "name": "createCustomRelayEvent",
      "discriminator": [
        37,
        30,
        81,
        45,
        26,
        113,
        4,
        56
      ]
    },
    {
      "name": "createRelayerSettingsEvent",
      "discriminator": [
        201,
        149,
        127,
        236,
        72,
        74,
        122,
        64
      ]
    },
    {
      "name": "resendFailedTransferEvent",
      "discriminator": [
        174,
        6,
        73,
        156,
        191,
        177,
        95,
        111
      ]
    },
    {
      "name": "sendMessageEvent",
      "discriminator": [
        178,
        176,
        174,
        212,
        10,
        219,
        181,
        92
      ]
    },
    {
      "name": "sendRelayerFee",
      "discriminator": [
        35,
        234,
        199,
        243,
        233,
        75,
        2,
        226
      ]
    },
    {
      "name": "transferSendEvent",
      "discriminator": [
        66,
        127,
        160,
        253,
        214,
        169,
        102,
        47
      ]
    },
    {
      "name": "updateChainTypeEvent",
      "discriminator": [
        222,
        181,
        194,
        27,
        71,
        150,
        255,
        221
      ]
    },
    {
      "name": "updateCustomRelayEvent",
      "discriminator": [
        142,
        97,
        25,
        93,
        32,
        185,
        111,
        159
      ]
    },
    {
      "name": "updateRelayerSettingsEvent",
      "discriminator": [
        254,
        45,
        252,
        115,
        156,
        106,
        129,
        31
      ]
    }
  ],
  "types": [
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
      "name": "createChainEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "id",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "createCustomRelayEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "fee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "createRelayerSettingsEvent",
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
            "name": "systemRelayerOwner",
            "type": "pubkey"
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
      "name": "customRelayer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "fee",
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
      "name": "resendFailedTransferEvent",
      "type": {
        "kind": "struct",
        "fields": [
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
      }
    },
    {
      "name": "sendMessageEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "value",
            "type": "u64"
          },
          {
            "name": "payload",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "sendRelayerFee",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "relayAccountOwner",
            "type": "pubkey"
          },
          {
            "name": "fee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "transferSendEvent",
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
          }
        ]
      }
    },
    {
      "name": "updateChainTypeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "chainType",
            "type": "u8"
          },
          {
            "name": "id",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "updateCustomRelayEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "fee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "updateRelayerSettingsEvent",
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
            "name": "systemFee",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
