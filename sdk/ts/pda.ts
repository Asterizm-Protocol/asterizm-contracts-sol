import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import {TOKEN_PROGRAM_ID} from "@solana/spl-token";
import { ATA_PROGRAM_ID } from "./program";

export function getSettingsPda(program: PublicKey) {
  const [settingsPda, _settingsPdaBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(anchor.utils.bytes.utf8.encode("settings"))],
      program
    );
  return settingsPda;
}

export function getRelayPda(program: PublicKey, owner: PublicKey) {
  const ownerSeed = owner.toBuffer();
  const [relayPda, _relayPdaBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(anchor.utils.bytes.utf8.encode("relay")), ownerSeed],
      program
    );
  return relayPda;
}

export function getChainPda(program: PublicKey, id: BN) {
  const idSeed = id.toBuffer("le", 8);
  const [relayPda, _relayPdaBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(anchor.utils.bytes.utf8.encode("chain")), idSeed],
      program
    );
  return relayPda;
}

export function getBlockedAccountPda(
  program: PublicKey,
  id: BN,
  user: PublicKey
) {
  const idSeed = id.toBuffer("le", 8);
  const userSeed = user.toBuffer();
  const [relayPda, _relayPdaBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("blocked")),
        idSeed,
        userSeed,
      ],
      program
    );
  return relayPda;
}

export function getIncomingTransferAccountPda(
  program: PublicKey,
  user: PublicKey,
  transferHash: number[],
) {
  const userSeed = user.toBuffer();
  const idSeed = Buffer.from(transferHash);
  const [relayPda, _relayPdaBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("incoming_transfer")),
        userSeed,
        idSeed,
      ],
      program
    );
  return relayPda;
}

export function getOutgoingTransferAccountPda(
  program: PublicKey,
  user: PublicKey,
  transferHash: number[],
) {
  const userSeed = user.toBuffer();
  const idSeed = Buffer.from(transferHash);
  const [relayPda, _relayPdaBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("outgoing_transfer")),
        userSeed,
        idSeed,
      ],
      program
    );
  return relayPda;
}

export function getClientAccountPda(program: PublicKey, user: PublicKey) {
  const userSeed = user.toBuffer();
  const [relayPda, _relayPdaBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(anchor.utils.bytes.utf8.encode("client")), userSeed],
      program
    );
  return relayPda;
}

export function getTrustedAccountPda(
  program: PublicKey,
  userAddress: PublicKey,
  chainId: BN
) {
  const idSeed = chainId.toBuffer("le", 8);
  const userSeed = userAddress.toBuffer();
  const [relayPda, _relayPdaBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("trusted_address")),
        userSeed,
        idSeed,
      ],
      program
    );
  return relayPda;
}

export function getSenderAccountPda(
  program: PublicKey,
  userAddress: PublicKey,
  address: PublicKey
) {
  const userSeed = userAddress.toBuffer();
  const addressSeed = address.toBuffer();
  const [relayPda, _relayPdaBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("sender")),
        userSeed,
        addressSeed,
      ],
      program
    );
  return relayPda;
}

export function getMintPda(
  program: PublicKey,
  userAddress: PublicKey,
  name: string
) {
  const userSeed = userAddress.toBuffer();
  const [relayPda, _relayPdaBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [
        userSeed,
        Buffer.from(anchor.utils.bytes.utf8.encode(name)),
        Buffer.from(anchor.utils.bytes.utf8.encode("asterizm-token-mint")),
      ],
      program
    );
  return relayPda;
}

export function getTokenClientAccountPda(
  program: PublicKey,
  userAddress: PublicKey,
  name: string
) {
  const userSeed = userAddress.toBuffer();
  const [relayPda, _relayPdaBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [
        userSeed,
        Buffer.from(anchor.utils.bytes.utf8.encode(name)),
        Buffer.from(anchor.utils.bytes.utf8.encode("asterizm-token-client")),
      ],
      program
    );
  return relayPda;
}
export function getNftClientAccountPda(
  program: PublicKey,
  userAddress: PublicKey,
) {
  const userSeed = userAddress.toBuffer();
  const [relayPda, _relayPdaBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [
        userSeed,
        Buffer.from(anchor.utils.bytes.utf8.encode("asterizm-nft-client")),
      ],
      program
    );
  return relayPda;
}

export function getNftMintPda(program: PublicKey, id: Buffer) {
  const [relayPda, _relayPdaBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(anchor.utils.bytes.utf8.encode("mint")), id],
      program
    );
  return relayPda;
}

export function getValueClientAccountPda(program: PublicKey, user: PublicKey) {
  const userSeed = user.toBuffer();
  const [relayPda, _relayPdaBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [
        userSeed,
        Buffer.from(anchor.utils.bytes.utf8.encode("asterizm-value-client")),
      ],
      program
    );
  return relayPda;
}

export function getAtaAccountPda(wallet: PublicKey, mint: PublicKey) {
    const [tokenAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [wallet.toBytes(), TOKEN_PROGRAM_ID.toBytes(), mint.toBytes()],
        ATA_PROGRAM_ID
    );

    return tokenAccount;
}
