import { PublicKey, Keypair } from "@solana/web3.js";
import { getInitializerProgramDataAddress, IInitializerProgramAPI } from "../program";
import BN from "bn.js";

export class InitializerBlockedAccounts {
  constructor(private readonly programAPI: IInitializerProgramAPI) {}

  async blockAccount(
    authority: Keypair,
    chainId: BN,
    userAddress: PublicKey
  ) {
    await this.programAPI
      .blockAccount(chainId, userAddress)
      .accounts({
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  }
}
