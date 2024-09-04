import { PublicKey, Keypair } from "@solana/web3.js";
import { getInitializerProgramDataAddress, IInitializerProgramAPI } from "../program";
import BN from "bn.js";

export class InitializeInitializer {
  constructor(private readonly programAPI: IInitializerProgramAPI) {}

  async initialize(
    authority: Keypair,
    manager: PublicKey,
    localChainId: BN
  ) {
    await this.programAPI
      .initialize(localChainId, manager)
      .accounts({
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  }

  async updateSettings(authority: Keypair, manager: PublicKey) {
    const programDataAddress = getInitializerProgramDataAddress();

    await this.programAPI
      .updateSettings(manager)
      .accounts({
        authority: authority.publicKey,
        programData: programDataAddress,
      })
      .signers([authority])
      .rpc();
  }
}
