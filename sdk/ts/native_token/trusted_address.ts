import { Keypair, PublicKey } from "@solana/web3.js";
import {
  CLIENT_PROGRAM_ID,
  INativeTokenExampleProgramAPI,
  NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
} from "../program";
import BN from "bn.js";
import {
  getClientAccountPda,
  getTokenClientAccountPda,
  getTrustedAccountPda,
} from "../pda";

export class TrustedAddress {
  constructor(private readonly programAPI: INativeTokenExampleProgramAPI) {}

  async create(
    authority: Keypair,
    name: string,
    address: PublicKey,
    chainId: BN
  ) {
    const tokenClientAccount = getTokenClientAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );
    const clientAccount = getClientAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount
    );
    const trustedAddress = getTrustedAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount,
      chainId
    );
    await this.programAPI
      .createClientTrustedAddress(name, chainId, address)
      .accounts({
        authority: authority.publicKey,
        clientAccount,
        trustedAddress,
      })
      .signers([authority])
      .rpc();
  }

  async remove(authority: Keypair, name: string, chainId: BN) {
    const tokenClientAccount = getTokenClientAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );
    const clientAccount = getClientAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount
    );
    const trustedAddress = getTrustedAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount,
      chainId
    );

    await this.programAPI
      .removeClientTrustedAddress(name, chainId)
      .accounts({
        authority: authority.publicKey,
        clientAccount,
        trustedAddress,
      })
      .signers([authority])
      .rpc();
  }
}
