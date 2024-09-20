import { Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  CLIENT_PROGRAM_ID,
  IValueExampleProgramAPI,
  RELAYER_PROGRAM_ID,
  TOKEN_EXAMPLE_PROGRAM_ID,
  VALUE_EXAMPLE_PROGRAM_ID,
} from "../program";
import BN from "bn.js";
import {
  getChainPda,
  getClientAccountPda,
  getIncomingTransferAccountPda,
  getOutgoingTransferAccountPda,
  getSenderAccountPda,
  getSettingsPda,
  getValueClientAccountPda,
} from "../pda";

export class ValueMessage {
  constructor(private readonly programAPI: IValueExampleProgramAPI) {}

  async send(
    signer: Keypair,
    authority: PublicKey,
    dstChainId: BN,
    dstAddress: PublicKey,
    amount: BN,
    transferHash: number[],
    trustedAddress: PublicKey
  ): Promise<TransactionInstruction> {
    const transferAccount = getOutgoingTransferAccountPda(
      CLIENT_PROGRAM_ID,
      authority,
      transferHash
    );

    const clientSettingsAccount = getSettingsPda(CLIENT_PROGRAM_ID);

    const chainAccount = getChainPda(RELAYER_PROGRAM_ID, dstChainId);

    const clientAccount = getClientAccountPda(CLIENT_PROGRAM_ID, authority);

    const valueClientAccount = getValueClientAccountPda(
      VALUE_EXAMPLE_PROGRAM_ID,
      authority
    );
    return this.programAPI
      .sendMessage(amount, dstAddress, dstChainId)
      .accountsPartial({
        signer: signer.publicKey,
        authority: authority,
        clientAccount,
        clientSettingsAccount,
        trustedAddress,
        transferAccount,
        valueClientAccount,
        chainAccount,
        relayerProgram: RELAYER_PROGRAM_ID,
      })
      .signers([signer])
      .instruction();
  }

  async receive(
    authority: Keypair,
    transferHash: number[],
    srcChainId: BN,
    srcAddress: PublicKey,
    txId: BN,
    payload: Buffer,
    clientAccountPda: PublicKey,
    clientTrustedAddressPda: PublicKey,
    dstAddress: PublicKey
  ) {
    const chainAccount = getChainPda(RELAYER_PROGRAM_ID, srcChainId);

    const clientSettingsAccount = getSettingsPda(CLIENT_PROGRAM_ID);

    const transferAccountPda = getIncomingTransferAccountPda(
      CLIENT_PROGRAM_ID,
      dstAddress,
      transferHash
    );

    const clientSender = getSenderAccountPda(
      CLIENT_PROGRAM_ID,
      authority.publicKey,
      authority.publicKey
    );

    await this.programAPI
      .receiveMessage(transferHash, srcChainId, srcAddress, txId, payload)
      .accounts({
        authority: authority.publicKey,
        transferAccount: transferAccountPda,
        clientAccount: clientAccountPda,
        clientTrustedAddress: clientTrustedAddressPda,
        clientSettingsAccount,
        chainAccount,
        relayerProgram: RELAYER_PROGRAM_ID,
        clientSender,
      })
      .signers([authority])
      .rpc();
  }

  async receiveInstruction(
    authority: Keypair,
    transferHash: number[],
    srcChainId: BN,
    srcAddress: PublicKey,
    txId: BN,
    payload: Buffer,
    clientAccountPda: PublicKey,
    clientTrustedAddressPda: PublicKey,
    dstAddress: PublicKey
  ): Promise<TransactionInstruction> {
    const chainAccount = getChainPda(RELAYER_PROGRAM_ID, srcChainId);

    const clientSettingsAccount = getSettingsPda(CLIENT_PROGRAM_ID);

    const transferAccountPda = getIncomingTransferAccountPda(
      CLIENT_PROGRAM_ID,
      dstAddress,
      transferHash
    );

    const clientSender = getSenderAccountPda(
      CLIENT_PROGRAM_ID,
      authority.publicKey,
      authority.publicKey
    );

    return this.programAPI
      .receiveMessage(transferHash, srcChainId, srcAddress, txId, payload)
      .accounts({
        authority: authority.publicKey,
        transferAccount: transferAccountPda,
        clientAccount: clientAccountPda,
        clientTrustedAddress: clientTrustedAddressPda,
        clientSettingsAccount,
        chainAccount,
        relayerProgram: RELAYER_PROGRAM_ID,
        clientSender,
      })
      .signers([authority])
      .instruction();
  }
}
