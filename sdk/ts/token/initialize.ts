import {Keypair, PublicKey, TransactionInstruction} from "@solana/web3.js";
import {
  CLIENT_PROGRAM_ID,
  ITokenExampleProgramAPI,
  TOKEN_EXAMPLE_PROGRAM_ID,
} from "../program";
import {
  getClientAccountPda,
  getSettingsPda,
  getTokenClientAccountPda,
} from "../pda";

export class InitializeToken {
  constructor(private readonly programAPI: ITokenExampleProgramAPI) {}

  async createMint(
    authority: Keypair,
    name: string,
    decimals: number,
    relayOwner: PublicKey,
    notifyTransferSendingResult: boolean,
    disableHashValidation: boolean
  ) {
    const tokenClientAccount = getTokenClientAccountPda(
      TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );

    const clientProgramSettings = getSettingsPda(CLIENT_PROGRAM_ID);
    const clientAccount = getClientAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount
    );

    await this.programAPI
      .createMint(
        name,
        decimals,
        relayOwner,
        notifyTransferSendingResult,
        disableHashValidation
      )
      .accountsPartial({
        authority: authority.publicKey,
        tokenClientAccount,
        clientProgramSettings,
        clientAccount,
      })
      .signers([authority])
      .rpc();
  }

  async createMintInstruction(
    authority: Keypair,
    name: string,
    decimals: number,
    relayOwner: PublicKey,
    notifyTransferSendingResult: boolean,
    disableHashValidation: boolean
  ): Promise<TransactionInstruction> {
    const tokenClientAccount = getTokenClientAccountPda(
      TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );

    const clientProgramSettings = getSettingsPda(CLIENT_PROGRAM_ID);
    const clientAccount = getClientAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount
    );

    return this.programAPI
      .createMint(
        name,
        decimals,
        relayOwner,
        notifyTransferSendingResult,
        disableHashValidation
      )
      .accountsPartial({
        authority: authority.publicKey,
        tokenClientAccount,
        clientProgramSettings,
        clientAccount,
      })
      .signers([authority])
      .instruction();
  }
}
