import { Keypair, PublicKey } from "@solana/web3.js";
import { IClientProgramAPI } from "../program";

export class ClientSender {
  constructor(private readonly programAPI: IClientProgramAPI) {}

  async create(authority: Keypair, userAddress: PublicKey, address: PublicKey) {
    await this.programAPI
      .createClientSender(userAddress, address)
      .accounts({
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  }

  async remove(authority: Keypair, userAddress: PublicKey, address: PublicKey) {
    await this.programAPI
      .removeClientSender(userAddress, address)
      .accounts({
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  }
}
