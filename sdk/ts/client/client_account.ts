import { Keypair, PublicKey } from "@solana/web3.js";
import { IClientProgramAPI } from "../program";

export class ClientAccount {
  constructor(private readonly programAPI: IClientProgramAPI) {}

  async create(
    authority: Keypair,
    userAddress: PublicKey,
    relayOwner: PublicKey,
    notifyTransferSendingResult: boolean,
    disableHashValidation: boolean
  ) {
    await this.programAPI
      .createClient(
        userAddress,
        relayOwner,
        notifyTransferSendingResult,
        disableHashValidation
      )
      .accounts({
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  }

  async update(
    authority: Keypair,
    userAddress: PublicKey,
    relayOwner: PublicKey,
    notifyTransferSendingResult: boolean,
    disableHashValidation: boolean
  ) {
    await this.programAPI
      .updateClient(
        userAddress,
        relayOwner,
        notifyTransferSendingResult,
        disableHashValidation
      )
      .accounts({
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  }
}
