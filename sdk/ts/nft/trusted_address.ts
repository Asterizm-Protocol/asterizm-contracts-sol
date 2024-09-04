import { Keypair, PublicKey } from "@solana/web3.js";
import {
  CLIENT_PROGRAM_ID,
  INftExampleProgramAPI,
  NFT_EXAMPLE_PROGRAM_ID,
} from "../program";
import BN from "bn.js";
import {
  getClientAccountPda, getNftClientAccountPda,
  getTrustedAccountPda,
} from "../pda";

export class TrustedAddress {
  constructor(private readonly programAPI: INftExampleProgramAPI) {}

  async create(
    authority: Keypair,
    address: PublicKey,
    chainId: BN
  ) {
    const nftClientAccount = getNftClientAccountPda(
        NFT_EXAMPLE_PROGRAM_ID,
        authority.publicKey
    );
    const clientAccount = getClientAccountPda(
      CLIENT_PROGRAM_ID,
        nftClientAccount
    );
    const trustedAddress = getTrustedAccountPda(
      CLIENT_PROGRAM_ID,
        nftClientAccount,
      chainId
    );
    await this.programAPI
      .createClientTrustedAddress(chainId, address)
      .accounts({
        authority: authority.publicKey,
        clientAccount,
        trustedAddress,
      })
      .signers([authority])
      .rpc();
  }

  async remove(authority: Keypair, chainId: BN) {
    const tokenClientAccount = getNftClientAccountPda(
        NFT_EXAMPLE_PROGRAM_ID,
        authority.publicKey
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
      .removeClientTrustedAddress(chainId)
      .accounts({
        authority: authority.publicKey,
        clientAccount,
        trustedAddress,
      })
      .signers([authority])
      .rpc();
  }
}
