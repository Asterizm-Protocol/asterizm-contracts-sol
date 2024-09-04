import { Keypair, PublicKey } from "@solana/web3.js";
import { IRelayerProgramAPI } from "../program";
import BN from "bn.js";

export class CustomRelay {
  constructor(private readonly programAPI: IRelayerProgramAPI) {}

  async create(authority: Keypair, owner: PublicKey, fee: BN) {
    await this.programAPI
      .createCustomRelay(owner, fee)
      .accounts({
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  }

  async update(authority: Keypair, owner: PublicKey, fee: BN) {
    await this.programAPI
      .updateCustomRelay(owner, fee)
      .accounts({
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  }
}
