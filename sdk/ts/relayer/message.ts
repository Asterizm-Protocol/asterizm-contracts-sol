import {Keypair, PublicKey, TransactionInstruction} from "@solana/web3.js";
import {
  CLIENT_PROGRAM_ID,
  INITIALIZER_PROGRAM_ID,
  IRelayerProgramAPI,
} from "../program";
import BN from "bn.js";
import { getBlockedAccountPda, getIncomingTransferAccountPda } from "../pda";

export class RelayMessage {
  constructor(private readonly programAPI: IRelayerProgramAPI) {}

  async send(
    authority: Keypair,
    relayOwner: PublicKey,
    dstChainId: BN,
    srcAddress: PublicKey,
    dstAddress: PublicKey,
    txId: BN,
    transferResultNotifyFlag: boolean,
    transferHash: number[],
    value: BN
  ) {
    await this.programAPI
      .sendMessage(
        relayOwner,
        dstChainId,
        srcAddress,
        dstAddress,
        txId,
        transferResultNotifyFlag,
        transferHash,
        value
      )
      .accounts({
        authority: authority.publicKey,
        relayAccountOwner: relayOwner,
      })
      .signers([authority])
      .rpc();
  }

  async transfer(
    authority: Keypair,
    relayOwner: PublicKey,
    srcChainId: BN,
    srcAddress: PublicKey,
    localChainId: BN,
    dstAddress: PublicKey,
    txId: BN,
    transferHash: number[],
    clientAccountPda: PublicKey,
    trustedAddressPda: PublicKey
  ) {
    const blockedDstAccountPda = getBlockedAccountPda(
      INITIALIZER_PROGRAM_ID,
      localChainId,
      dstAddress
    );

    const blockedSrcAccountPda = getBlockedAccountPda(
      INITIALIZER_PROGRAM_ID,
      srcChainId,
      srcAddress
    );

    const transferAccountPda = getIncomingTransferAccountPda(
      INITIALIZER_PROGRAM_ID,
        dstAddress,
        transferHash
    );

    const clientTransferAccountPda = getIncomingTransferAccountPda(
      CLIENT_PROGRAM_ID,
        dstAddress,
        transferHash
    );

    await this.programAPI
      .transferMessage(
        relayOwner,
        srcChainId,
        srcAddress,
        dstAddress,
        txId,
        transferHash
      )
      .accounts({
        authority: authority.publicKey,
        dstAccount: dstAddress,
        transferAccount: transferAccountPda,
        blockedSrcAccount: blockedSrcAccountPda,
        blockedDstAccount: blockedDstAccountPda,
        clientAccount: clientAccountPda,
        trustedAddress: trustedAddressPda,
        clientTransferAccount: clientTransferAccountPda,
      })
      .signers([authority])
      .rpc();
  }

  async transferInstruction(
    authority: Keypair,
    relayOwner: PublicKey,
    srcChainId: BN,
    srcAddress: PublicKey,
    localChainId: BN,
    dstAddress: PublicKey,
    txId: BN,
    transferHash: number[],
    clientAccountPda: PublicKey,
    trustedAddressPda: PublicKey
  ): Promise<TransactionInstruction> {
    const blockedDstAccountPda = getBlockedAccountPda(
      INITIALIZER_PROGRAM_ID,
      localChainId,
      dstAddress
    );

    const blockedSrcAccountPda = getBlockedAccountPda(
      INITIALIZER_PROGRAM_ID,
      srcChainId,
      srcAddress
    );

    const transferAccountPda = getIncomingTransferAccountPda(
      INITIALIZER_PROGRAM_ID,
        dstAddress,
        transferHash
    );

    const clientTransferAccountPda = getIncomingTransferAccountPda(
      CLIENT_PROGRAM_ID,
        dstAddress,
        transferHash
    );

    return this.programAPI
      .transferMessage(
        relayOwner,
        srcChainId,
        srcAddress,
        dstAddress,
        txId,
        transferHash
      )
      .accounts({
        authority: authority.publicKey,
        dstAccount: dstAddress,
        transferAccount: transferAccountPda,
        blockedSrcAccount: blockedSrcAccountPda,
        blockedDstAccount: blockedDstAccountPda,
        clientAccount: clientAccountPda,
        trustedAddress: trustedAddressPda,
        clientTransferAccount: clientTransferAccountPda,
      })
      .signers([authority])
      .instruction();
  }
}
