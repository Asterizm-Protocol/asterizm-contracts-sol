import {Keypair, PublicKey, TransactionInstruction} from "@solana/web3.js";
import {
  CLIENT_PROGRAM_ID,
  INativeTokenExampleProgramAPI,
  RELAYER_PROGRAM_ID,
  NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
} from "../program";
import BN from "bn.js";
import {
  getChainPda,
  getClientAccountPda,
  getIncomingTransferAccountPda,
  getOutgoingTransferAccountPda,
  getSenderAccountPda,
  getSettingsPda,
  getTokenClientAccountPda,
  getVaultAccountPda,
} from "../pda";

export class TokenMessage {
  constructor(private readonly programAPI: INativeTokenExampleProgramAPI) {}

  async send(
    signer: Keypair,
    authority: PublicKey,
    dstChainId: BN,
    toAddress: PublicKey,
    amount: BN,
    name: string,
    mint: PublicKey,
    from: PublicKey,
    transferHash: number[],
    trustedAddress: PublicKey
  ) {
    const tokenClientAccount = getTokenClientAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority,
      name
    );
    
    const vault = getVaultAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority,
      name
    );

    const transferAccount = getOutgoingTransferAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount,
      transferHash
    );

    const clientSettingsAccount = getSettingsPda(CLIENT_PROGRAM_ID);

    const chainAccount = getChainPda(RELAYER_PROGRAM_ID, dstChainId);

    const clientAccount = getClientAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount
    );

    await this.programAPI
      .sendMessage(name, transferHash, amount, toAddress, dstChainId)
      .accountsPartial({
        signer: signer.publicKey,
        tokenAuthority: authority,
        clientAccount,
        tokenClientAccount,
        mint,
        vault,
        from,
        clientSettingsAccount,
        trustedAddress,
        transferAccount,
        chainAccount,
        relayerProgram: RELAYER_PROGRAM_ID,
      })
      .signers([signer])
      .rpc();
  }

  async sendInstruction(
    signer: Keypair,
    authority: PublicKey,
    dstChainId: BN,
    toAddress: PublicKey,
    amount: BN,
    name: string,
    mint: PublicKey,
    from: PublicKey,
    transferHash: number[],
    trustedAddress: PublicKey
  ): Promise<TransactionInstruction> {
    const tokenClientAccount = getTokenClientAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority,
      name
    );

    const vault = getVaultAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority,
      name
    );

    const transferAccount = getOutgoingTransferAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount,
      transferHash
    );

    const clientSettingsAccount = getSettingsPda(CLIENT_PROGRAM_ID);

    const chainAccount = getChainPda(RELAYER_PROGRAM_ID, dstChainId);

    const clientAccount = getClientAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount
    );

    return this.programAPI
      .sendMessage(name, transferHash, amount, toAddress, dstChainId)
      .accountsPartial({
        signer: signer.publicKey,
        tokenAuthority: authority,
        clientAccount,
        tokenClientAccount,
        mint,
        vault,
        from,
        clientSettingsAccount,
        trustedAddress,
        transferAccount,
        chainAccount,
        relayerProgram: RELAYER_PROGRAM_ID,
      })
      .signers([signer])
      .instruction();
  }

  async receive(
    authority: Keypair,
    name: string,
    transferHash: number[],
    srcChainId: BN,
    srcAddress: PublicKey,
    txId: BN,
    payload: Buffer,
    mint: PublicKey,
    clientAccountPda: PublicKey,
    clientTrustedAddressPda: PublicKey,
    dstAddress: PublicKey,
    to: PublicKey,
    toAta: PublicKey
  ) {
    const chainAccount = getChainPda(RELAYER_PROGRAM_ID, srcChainId);

    const clientSettingsAccount = getSettingsPda(CLIENT_PROGRAM_ID);

    const transferAccountPda = getIncomingTransferAccountPda(
      CLIENT_PROGRAM_ID,
      dstAddress,
      transferHash
    );
    const tokenClientAccount = getTokenClientAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );

    const vault = getVaultAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );

    const clientSender = getSenderAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount,
      authority.publicKey
    );

    await this.programAPI
      .receiveMessage(name, transferHash, srcChainId, srcAddress, txId, payload)
      .accountsPartial({
        authority: authority.publicKey,
        transferAccount: transferAccountPda,
        clientAccount: clientAccountPda,
        clientTrustedAddress: clientTrustedAddressPda,
        mint,
        vault,
        clientSettingsAccount,
        to,
        tokenAccount: toAta,
        chainAccount,
        tokenClientAccount,
        relayerProgram: RELAYER_PROGRAM_ID,
        clientSender,
      })
      .signers([authority])
      .rpc({ skipPreflight: true });
  }

  async receiveInstruction(
    authority: Keypair,
    name: string,
    transferHash: number[],
    srcChainId: BN,
    srcAddress: PublicKey,
    txId: BN,
    payload: Buffer,
    mint: PublicKey,
    clientAccountPda: PublicKey,
    clientTrustedAddressPda: PublicKey,
    dstAddress: PublicKey,
    to: PublicKey,
    toAta: PublicKey
  ): Promise<TransactionInstruction> {
    const chainAccount = getChainPda(RELAYER_PROGRAM_ID, srcChainId);

    const clientSettingsAccount = getSettingsPda(CLIENT_PROGRAM_ID);

    const transferAccountPda = getIncomingTransferAccountPda(
      CLIENT_PROGRAM_ID,
      dstAddress,
      transferHash
    );
    const tokenClientAccount = getTokenClientAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );

    const vault = getVaultAccountPda(
      NATIVE_TOKEN_EXAMPLE_PROGRAM_ID,
      authority.publicKey,
      name
    );

    const clientSender = getSenderAccountPda(
      CLIENT_PROGRAM_ID,
      tokenClientAccount,
      authority.publicKey
    );

    return this.programAPI
      .receiveMessage(name, transferHash, srcChainId, srcAddress, txId, payload)
      .accountsPartial({
        authority: authority.publicKey,
        transferAccount: transferAccountPda,
        clientAccount: clientAccountPda,
        clientTrustedAddress: clientTrustedAddressPda,
        mint,
        vault,
        clientSettingsAccount,
        to,
        tokenAccount: toAta,
        chainAccount,
        tokenClientAccount,
        relayerProgram: RELAYER_PROGRAM_ID,
        clientSender,
      })
      .signers([authority])
      .instruction();
  }
}
