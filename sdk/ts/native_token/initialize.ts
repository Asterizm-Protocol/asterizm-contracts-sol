import {Keypair, PublicKey, TransactionInstruction} from "@solana/web3.js";
import {
  CLIENT_PROGRAM_ID,
  INativeTokenExampleProgramAPI,
  NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
} from "../program";
import {
  getClientAccountPda,
  getSettingsPda,
  getTokenClientAccountPda,
  getVaultAccountPda,
} from "../pda";
import BN from "bn.js";

export class InitializeToken {
  constructor(private readonly programAPI: INativeTokenExampleProgramAPI) {}

  async createVault(
    authority: Keypair,
    name: string,
    relayOwner: PublicKey,
    mint: PublicKey,
    notifyTransferSendingResult: boolean,
    disableHashValidation: boolean,
    refundEnabled: boolean,
    fee: BN,
    refundFee: BN,
  ) {
    const tokenClientAccount = getTokenClientAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );
    const vaultAccount = getVaultAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );

    const clientProgramSettings = getSettingsPda(CLIENT_PROGRAM_ID);
    const clientAccount = getClientAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount
    );

    await this.programAPI
      .createVault(
        name,
        relayOwner,
        notifyTransferSendingResult,
        disableHashValidation,
        refundEnabled,
        fee,
        refundFee,
      )
      .accountsPartial({
        authority: authority.publicKey,
        tokenClientAccount,
        clientProgramSettings,
        clientAccount,
        vault: vaultAccount,
        mint,
      })
      .signers([authority])
      .rpc();
  }

  async createVaultInstruction(
    authority: Keypair,
    name: string,
    relayOwner: PublicKey,
    mint: PublicKey,
    notifyTransferSendingResult: boolean,
    disableHashValidation: boolean,
    refundEnabled: boolean,
    fee: BN,
    refundFee: BN,
  ): Promise<TransactionInstruction> {
    const tokenClientAccount = getTokenClientAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );

    const vaultAccount = getVaultAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );

    const clientProgramSettings = getSettingsPda(CLIENT_PROGRAM_ID);
    const clientAccount = getClientAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount
    );

    return this.programAPI
      .createVault(
        name,
        relayOwner,
        notifyTransferSendingResult,
        disableHashValidation,
        refundEnabled,
        fee,
        refundFee
      )
      .accountsPartial({
        authority: authority.publicKey,
        tokenClientAccount,
        clientProgramSettings,
        clientAccount,
        vault: vaultAccount,
        mint,
      })
      .signers([authority])
      .instruction();
  }


  async sendFromVault(
    authority: Keypair,
    mint: PublicKey,
    name: string,
    toAta: PublicKey,
    amount: BN,
  ) {
    const tokenClientAccount = getTokenClientAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );
    const vaultAccount = getVaultAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );

    await this.programAPI
      .sendFromVault(name, amount)
      .accountsPartial({
        authority: authority.publicKey,
        tokenAccount: toAta,
        tokenClientAccount,
        vault: vaultAccount,
        mint,
      })
      .signers([authority])
      .rpc();
  }

  async updateFee(
    authority: Keypair,
    name: string,
    fee: BN,
    refundFee: BN,
  ) {
    await this.programAPI
      .updateFee(name, fee, refundFee)
      .accountsPartial({
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  }
}
