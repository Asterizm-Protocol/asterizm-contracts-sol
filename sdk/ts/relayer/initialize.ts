import { PublicKey, Keypair } from "@solana/web3.js";
import { getRelayerProgramDataAddress, IRelayerProgramAPI } from "../program";
import BN from "bn.js";

export class InitializeRelay {
  constructor(private readonly programAPI: IRelayerProgramAPI) {}

  async initialize(
    authority: Keypair,
    systemRelayerOwner: PublicKey,
    manager: PublicKey,
    systemFee: BN,
    localChainId: BN
  ) {
    await this.programAPI
      .initialize(systemRelayerOwner, localChainId, manager, systemFee)
      .accounts({
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  }

  async updateSettings(authority: Keypair, manager: PublicKey, systemFee: BN) {
    const programDataAddress = getRelayerProgramDataAddress();

    await this.programAPI
      .updateSettings(manager, systemFee)
      .accounts({
        authority: authority.publicKey,
        programData: programDataAddress,
      })
      .signers([authority])
      .rpc();
  }
}
