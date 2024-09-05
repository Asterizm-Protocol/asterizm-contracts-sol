# Asterizm

Asterizm protocol affords receive and send cross chain transfer of any messages  

## Settings

Current programs are written with the usage of `Solana` version 1.18.20 and `Anchor` version 0.30.1.

### Installation

`Solana` can be installed by [this lint](https://docs.solanalabs.com/cli/install). 
`Anchor` installation docs can be taken from [here](https://www.anchor-lang.com/docs/installation).

### Build
```bash
anchor build
```

### Run tests
```bash
anchor test
```

### Deploy
```bash
anchor deploy
```
or
```bash
solana program deploy ./target/deploy/<..>.so
```

### Upgrade
```bash
anchor upgrade <target/deploy/program.so> --program-id <program-id>
``` 
or
```bash
# New version of the program can be uploaded by any developer
solana program write-buffer --ws wss://api.mainnet-beta.solana.com ./target/deploy/<..>.so
# Than new buffer authority can be changed to the owner of the program 
solana program set-buffer-authority <PROGRAM_ADDRESS> --new-buffer-authority <New Buffer Authority>
# Only program owner can change old program with new buffer
solana program deploy --program-id <PROGRAM_ADDRESS> --buffer <BUFFER_ADDRESS>
# Developers can check if they own any abandoned buffer accounts 
solana program show --buffers
# After upgrade all buffers can be closed to reclaim the SOL balance
solana program close --buffers
```

For more info you can look up [here](https://solana.com/docs/programs/deploying).

### Gen new address for program

One can create new address for program to deploy separate configuration:

```bash
solana-keygen grind --starts-with Asterizm:3
```

Replace old one in `Anchor.toml` and `declare_id!(..)` macros with the new one, and deploy the new one.

### Change `Solana` network

One can deploy programs to any `Solana` network.

To get current config one must run following:

```bash
solana config get
```

How to change network is described [here](https://solana.com/docs/core/clusters).

### Update `IDL`

In order to work with correct cpi one must update compiled `idl`s with the new ones, copying them from `target` dir to `idls` dir. 

## Programs

Current repo contains 3 system programs: relayer, initializer and client, and 2 example programs, that are showing the
usage of Asterizm protocol.

### Relayer

Relayer program can send and receive messages, create custom relayers, take fees. 

#### Instructions

1. Init
2. Update Settings
3. Create custom relayer
4. Update custom relayer
5. Create chain
6. Create Transfer event
7. Create Received message
8. Notify 

### Initializer

Initializer program can create and send messages through relayer program and transfer received messages to clients program

#### Instructions

1. Init
2. Update Settings
3. Send message
4. Block account
5. Resend message
6. Receive message
7. Notify

### Client

Client program can create transfers and receive messages with custom payload

#### Instructions

1. Init
2. Update Settings
3. Create client settings
4. Update client settings
5. Client receive callback
6. Client create transfer
7. Transfer message external
8. Client receive message
9. Receive message external

#### Multi token example

Example of multi token program, that can burn and mint SPL tokens and transfer events using Asterizm protocol

#### Instructions

1. Init
2. Mint
3. Burn

#### NFT example

Example of NFT program, that can burn and mint NFT and transfer events using Asterizm protocol

#### Instructions

1. Init
2. Mint
3. Transfer

## Scripts

Scripts folder contains useful scripts to configure `Solana` programs. To run use:

```bash
npx ts-node scripts/<..>.ts
```

## Problems

1. Fixed "account data too small for instruction"

```bash
solana program extend <progrem_id> <more_bytes>
```
