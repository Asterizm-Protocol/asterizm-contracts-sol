import { Keypair, PublicKey } from "@solana/web3.js";
import { IClientProgramAPI } from "../program";
import BN from "bn.js";

export class TrustedAddress {
  constructor(private readonly programAPI: IClientProgramAPI) {}

  async create(
    authority: Keypair,
    userAddress: PublicKey,
    address: PublicKey,
    chainId: BN
  ) {
    await this.programAPI
      .createClientTrustedAddress(userAddress, chainId, address)
      .accounts({
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  }

  async remove(
    authority: Keypair,
    userAddress: PublicKey,
    chainId: BN
  ) {
    await this.programAPI
      .removeClientTrustedAddress(userAddress, chainId)
      .accounts({
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  }
}
