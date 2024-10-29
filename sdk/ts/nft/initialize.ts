import { Keypair, PublicKey } from "@solana/web3.js";
import {
  CLIENT_PROGRAM_ID,
  INftExampleProgramAPI, NFT_EXAMPLE_PROGRAM_ID,
} from "../program";
import {
  getClientAccountPda,
  getNftClientAccountPda,
  getSettingsPda,
} from "../pda";

export class InitializeNft {
  constructor(private readonly programAPI: INftExampleProgramAPI) {}

  async createClient(
    authority: Keypair,
    relayOwner: PublicKey,
    notifyTransferSendingResult: boolean,
    disableHashValidation: boolean,
    refund_enabled: boolean,
  ) {
    const nftClientAccount = getNftClientAccountPda(
      NFT_EXAMPLE_PROGRAM_ID,
      authority.publicKey
    );

    const clientAccount = getClientAccountPda(
      CLIENT_PROGRAM_ID,
      nftClientAccount
    );

    const clientProgramSettings = getSettingsPda(CLIENT_PROGRAM_ID);

    await this.programAPI
      .createNftClient(
        relayOwner,
        notifyTransferSendingResult,
        disableHashValidation,
        refund_enabled,
      )
      .accountsPartial({
        authority: authority.publicKey,
        nftClientAccount,
        clientAccount,
        clientProgramSettings,
      })
      .signers([authority])
      .rpc();
  }

  async updateClient(
    authority: Keypair,
    relayOwner: PublicKey,
    notifyTransferSendingResult: boolean,
    disableHashValidation: boolean,
    refund_enabled: boolean,
  ) {
    const nftClientAccount = getNftClientAccountPda(
      NFT_EXAMPLE_PROGRAM_ID,
      authority.publicKey
    );

    const clientAccount = getClientAccountPda(
      CLIENT_PROGRAM_ID,
      nftClientAccount
    );

    const clientProgramSettings = getSettingsPda(CLIENT_PROGRAM_ID);

    await this.programAPI
      .updateNftClient(
        relayOwner,
        notifyTransferSendingResult,
        disableHashValidation,
        refund_enabled,
      )
      .accountsPartial({
        authority: authority.publicKey,
        nftClientAccount,
        clientAccount,
        clientProgramSettings,
      })
      .signers([authority])
      .rpc();
  }
}
