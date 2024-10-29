import {Keypair, PublicKey, TransactionInstruction} from "@solana/web3.js";
import {
  CLIENT_PROGRAM_ID,
  ITokenExampleProgramAPI,
  TOKEN_EXAMPLE_PROGRAM_ID,
} from "../program";
import {
  getClientAccountPda,
  getOutgoingTransferAccountPda,
  getRefundAccountPda,
  getRefundTransferAccountPda,
  getTokenClientAccountPda,
} from "../pda";

export class TokenMessage {
  constructor(private readonly programAPI: ITokenExampleProgramAPI) {}

  async addRefundRequest(
    signer: Keypair,
    authority: PublicKey,
    name: string,
    transferHash: number[],
  ) {
    const tokenClientAccount = getTokenClientAccountPda(
      TOKEN_EXAMPLE_PROGRAM_ID,
      authority,
      name
    );

    const refundTransferAccount = getRefundTransferAccountPda(
      TOKEN_EXAMPLE_PROGRAM_ID,
      authority,
      transferHash
    );

    const transferAccount = getOutgoingTransferAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount,
      transferHash
    );

    const clientAccount = getClientAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount
    );

    const clientRefundAccount = getRefundAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount,
      transferHash
    );

    await this.programAPI
      .addRefundRequest(name, transferHash)
      .accountsPartial({
        signer: signer.publicKey,
        tokenAuthority: authority,
        clientAccount,
        tokenClientAccount,
        transferAccount,
        refundTransferAccount,
        clientRefundAccount,
      })
      .signers([signer])
      .rpc();
  }

  async addRefundRequestInstruction(
    signer: Keypair,
    authority: PublicKey,
    name: string,
    transferHash: number[],
  ): Promise<TransactionInstruction> {
    const tokenClientAccount = getTokenClientAccountPda(
      TOKEN_EXAMPLE_PROGRAM_ID,
      authority,
      name
    );

    const refundTransferAccount = getRefundTransferAccountPda(
      TOKEN_EXAMPLE_PROGRAM_ID,
      authority,
      transferHash
    );

    const transferAccount = getOutgoingTransferAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount,
      transferHash
    );

    const clientAccount = getClientAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount
    );

    const clientRefundAccount = getRefundAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount,
      transferHash
    );

    return this.programAPI
      .addRefundRequest(name, transferHash)
      .accountsPartial({
        signer: signer.publicKey,
        tokenAuthority: authority,
        clientAccount,
        tokenClientAccount,
        transferAccount,
        refundTransferAccount,
        clientRefundAccount,
      })
      .signers([signer])
      .instruction();
  }

  async processRefundRequest(
    authority: Keypair,
    name: string,
    transferHash: number[],
    status: boolean,
    mint: PublicKey,
    clientAccountPda: PublicKey,
    to: PublicKey,
    toAta: PublicKey
  ) {
    const tokenClientAccount = getTokenClientAccountPda(
      TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );

    const transferAccount = getOutgoingTransferAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount,
      transferHash
    );

    const clientRefundAccount = getRefundAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount,
      transferHash
    );

    await this.programAPI
      .processRefundRequest(name, transferHash, status)
      .accountsPartial({
        signer: authority.publicKey,
        transferAccount,
        clientAccount: clientAccountPda,
        mint,
        to,
        tokenAccount: toAta,
        tokenClientAccount,
        clientRefundAccount,
      })
      .signers([authority])
      .rpc();
  }

  async processRefundRequestInstruction(
    authority: Keypair,
    name: string,
    transferHash: number[],
    status: boolean,
    mint: PublicKey,
    clientAccountPda: PublicKey,
    to: PublicKey,
    toAta: PublicKey
  ): Promise<TransactionInstruction> {
    const tokenClientAccount = getTokenClientAccountPda(
      TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );

    const transferAccount = getOutgoingTransferAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount,
      transferHash
    );

    const clientRefundAccount = getRefundAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount,
      transferHash
    );

    return this.programAPI
      .processRefundRequest(name, transferHash, status)
      .accountsPartial({
        signer: authority.publicKey,
        transferAccount,
        clientAccount: clientAccountPda,
        mint,
        to,
        tokenAccount: toAta,
        tokenClientAccount,
        clientRefundAccount,
      })
      .signers([authority])
      .instruction();
  }
}
