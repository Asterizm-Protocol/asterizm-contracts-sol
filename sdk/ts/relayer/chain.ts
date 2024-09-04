import { Keypair, PublicKey } from "@solana/web3.js";
import { IRelayerProgramAPI } from "../program";
import BN from "bn.js";

export class Chain {
  constructor(private readonly programAPI: IRelayerProgramAPI) {}

  async create(authority: Keypair, id: BN, name: string, chainType: number) {
    await this.programAPI
      .createChain(id, name, chainType)
      .accounts({
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  }

  async update(authority: Keypair, id: BN, chainType: number) {
    await this.programAPI
      .updateChainType(id, chainType)
      .accounts({
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  }
}
