import { Keypair, PublicKey } from "@solana/web3.js";
import {
  CLIENT_PROGRAM_ID,
  INativeTokenExampleProgramAPI,
  NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
} from "../program";
import {
  getClientAccountPda,
  getSenderAccountPda,
  getTokenClientAccountPda,
} from "../pda";

export class ClientSender {
  constructor(private readonly programAPI: INativeTokenExampleProgramAPI) {}

  async create(authority: Keypair, name: string, address: PublicKey) {
    const tokenClientAccount = getTokenClientAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );
    const clientAccount = getClientAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount
    );
    const sender = getSenderAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount,
      address
    );

    await this.programAPI
      .createClientSender(name, address)
      .accounts({
        authority: authority.publicKey,
        clientAccount,
        sender,
      })
      .signers([authority])
      .rpc();
  }

  async remove(authority: Keypair, name: string, address: PublicKey) {
    const tokenClientAccount = getTokenClientAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );
    const clientAccount = getClientAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount
    );
    const sender = getSenderAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount,
      address
    );

    await this.programAPI
      .removeClientSender(name, address)
      .accounts({
        authority: authority.publicKey,
        clientAccount,
        sender,
      })
      .signers([authority])
      .rpc();
  }
}
