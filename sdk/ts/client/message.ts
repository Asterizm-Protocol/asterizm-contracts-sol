import {Keypair, PublicKey, TransactionInstruction} from "@solana/web3.js";
import {
  CLIENT_PROGRAM_ID,
  IClientProgramAPI,
  INITIALIZER_PROGRAM_ID,
  RELAYER_PROGRAM_ID,
} from "../program";
import BN from "bn.js";
import {
  getBlockedAccountPda,
  getChainPda,
  getIncomingTransferAccountPda,
  getOutgoingTransferAccountPda,
  getRelayPda,
  getSenderAccountPda,
  getSettingsPda,
} from "../pda";

export class ClientMessage {
  constructor(private readonly programAPI: IClientProgramAPI) {}

  async initSend(
    authority: Keypair,
    dstChainId: BN,
    payload: Buffer,
    txId: number,
    transferHash: number[],
  ) {
    const transferAccountPda = getOutgoingTransferAccountPda(
      CLIENT_PROGRAM_ID,
      authority.publicKey,
      transferHash
    );

    await this.programAPI
      .initSendMessage(authority.publicKey, dstChainId, payload, txId)
      .accountsPartial({
        authority: authority.publicKey,
        transferAccount: transferAccountPda,
      })
      .signers([authority])
      .rpc();
  }

  async send(
    authority: Keypair,
    srcAddress: PublicKey,
    dstAddress: PublicKey,
    relayOwner: PublicKey,
    systemRelayOwner: PublicKey,
    localChainId: BN,
    dstChainId: BN,
    txId: number,
    transferHash: number[],
    value: BN
  ) {
    const blockedSrcAccountPda = getBlockedAccountPda(
      INITIALIZER_PROGRAM_ID,
      localChainId!,
      srcAddress
    );
    const blockedDstAccountPda = getBlockedAccountPda(
      INITIALIZER_PROGRAM_ID,
      dstChainId!,
      dstAddress
    );

    const initializerTransferAccount = getOutgoingTransferAccountPda(
      INITIALIZER_PROGRAM_ID,
      srcAddress,
      transferHash
    );

    const transferAccount = getOutgoingTransferAccountPda(
      CLIENT_PROGRAM_ID,
      srcAddress,
      transferHash
    );

    const chainPda = getChainPda(RELAYER_PROGRAM_ID, dstChainId);
    const relayPda = getRelayPda(RELAYER_PROGRAM_ID, relayOwner);
    const relayerSettingsPda = getSettingsPda(RELAYER_PROGRAM_ID);
    const initializerSettingsPda = getSettingsPda(INITIALIZER_PROGRAM_ID);
    const sender = getSenderAccountPda(
      CLIENT_PROGRAM_ID,
      srcAddress,
      authority.publicKey
    );

    await this.programAPI
      .sendMessage(srcAddress, dstChainId, txId, transferHash, value)
      .accountsPartial({
        authority: authority.publicKey,
        relayAccountOwner: relayOwner,
        systemRelayAccountOwner: systemRelayOwner,
        relayerSettingsAccount: relayerSettingsPda,
        initializerSettingsAccount: initializerSettingsPda,
        relayAccount: relayPda,
        chainAccount: chainPda,
        blockedSrcAccount: blockedSrcAccountPda,
        blockedDstAccount: blockedDstAccountPda,
        initializerTransferAccount,
        transferAccount,
        sender,
      })
      .signers([authority])
      .rpc();
  }

  async sendInstruction(
    authority: Keypair,
    srcAddress: PublicKey,
    dstAddress: PublicKey,
    relayOwner: PublicKey,
    systemRelayOwner: PublicKey,
    localChainId: BN,
    dstChainId: BN,
    txId: number,
    transferHash: number[],
    value: BN
  ): Promise<TransactionInstruction> {
    const blockedSrcAccountPda = getBlockedAccountPda(
      INITIALIZER_PROGRAM_ID,
      localChainId!,
      srcAddress
    );
    const blockedDstAccountPda = getBlockedAccountPda(
      INITIALIZER_PROGRAM_ID,
      dstChainId!,
      dstAddress
    );

    const initializerTransferAccount = getOutgoingTransferAccountPda(
      INITIALIZER_PROGRAM_ID,
      srcAddress,
      transferHash
    );

    const transferAccount = getOutgoingTransferAccountPda(
      CLIENT_PROGRAM_ID,
      srcAddress,
      transferHash
    );

    const chainPda = getChainPda(RELAYER_PROGRAM_ID, dstChainId);
    const relayPda = getRelayPda(RELAYER_PROGRAM_ID, relayOwner);
    const relayerSettingsPda = getSettingsPda(RELAYER_PROGRAM_ID);
    const initializerSettingsPda = getSettingsPda(INITIALIZER_PROGRAM_ID);
    const sender = getSenderAccountPda(
      CLIENT_PROGRAM_ID,
      srcAddress,
      authority.publicKey
    );

    return this.programAPI
      .sendMessage(srcAddress, dstChainId, txId, transferHash, value)
      .accountsPartial({
        authority: authority.publicKey,
        relayAccountOwner: relayOwner,
        systemRelayAccountOwner: systemRelayOwner,
        relayerSettingsAccount: relayerSettingsPda,
        initializerSettingsAccount: initializerSettingsPda,
        relayAccount: relayPda,
        chainAccount: chainPda,
        blockedSrcAccount: blockedSrcAccountPda,
        blockedDstAccount: blockedDstAccountPda,
        initializerTransferAccount,
        transferAccount,
        sender,
      })
      .signers([authority])
      .instruction();
  }

  async receive(
    authority: Keypair,
    dstAddress: PublicKey,
    srcChainId: BN,
    srcAddress: PublicKey,
    payload: Buffer,
    transferHash: number[],
    txId: number
  ) {
    const transferAccountPda = getIncomingTransferAccountPda(
      CLIENT_PROGRAM_ID,
      dstAddress,
      transferHash
    );

    const senderPda = getSenderAccountPda(
      CLIENT_PROGRAM_ID,
      dstAddress,
      authority.publicKey
    );

    await this.programAPI
      .receiveMessage(
        dstAddress,
        txId,
        srcChainId,
        srcAddress,
        transferHash,
        payload
      )
      .accountsPartial({
        authority: authority.publicKey,
        transferAccount: transferAccountPda,
        sender: senderPda,
      })
      .signers([authority])
      .rpc();
  }
}
