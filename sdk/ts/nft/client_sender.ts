import { Keypair, PublicKey } from "@solana/web3.js";
import {
  CLIENT_PROGRAM_ID,
  INftExampleProgramAPI,
  NFT_EXAMPLE_PROGRAM_ID,
} from "../program";
import {
  getClientAccountPda,
  getNftClientAccountPda,
  getSenderAccountPda,
} from "../pda";

export class ClientSender {
  constructor(private readonly programAPI: INftExampleProgramAPI) {}

  async create(authority: Keypair, address: PublicKey) {
    const tokenClientAccount = getNftClientAccountPda(
      NFT_EXAMPLE_PROGRAM_ID,
      authority.publicKey
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
      .createClientSender(address)
      .accounts({
        authority: authority.publicKey,
        clientAccount,
        sender,
      })
      .signers([authority])
      .rpc();
  }

  async remove(authority: Keypair, address: PublicKey) {
    const tokenClientAccount = getNftClientAccountPda(
      NFT_EXAMPLE_PROGRAM_ID,
      authority.publicKey
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
      .removeClientSender(address)
      .accounts({
        authority: authority.publicKey,
        clientAccount,
        sender,
      })
      .signers([authority])
      .rpc();
  }
}
