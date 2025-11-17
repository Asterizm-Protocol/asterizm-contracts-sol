/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/asterizm_value_example.json`.
 */
export type AsterizmValueExample = {
  "address": "ASXrQjsqRT6YsE3xYio4i2LKjbLrGQqG4BQ77VfUsmEV",
  "metadata": {
    "name": "asterizmValueExample",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createValueClient",
      "discriminator": [
        90,
        85,
        58,
        2,
        197,
        193,
        251,
        76
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "valueClientAccount",
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
                  118,
                  97,
                  108,
                  117,
                  101,
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
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
          "name": "authority"
        },
        {
          "name": "valueClientAccount",
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
                  118,
                  97,
                  108,
                  117,
                  101,
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
      "name": "valueClientAccount",
      "discriminator": [
        249,
        19,
        190,
        201,
        247,
        169,
        244,
        32
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
      "name": "valueClientAccount",
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
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
