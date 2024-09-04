import { Keypair, PublicKey } from "@solana/web3.js";
import { IInitializerProgramAPI, RELAYER_PROGRAM_ID } from "../program";
import BN from "bn.js";
import { getChainPda, getRelayPda } from "../pda";

export class InitializerMessage {
  constructor(private readonly programAPI: IInitializerProgramAPI) {}

  async send(
    authority: Keypair,
    relayOwner: PublicKey,
    systemRelayOwner: PublicKey,
    dstChainId: BN,
    srcAddress: PublicKey,
    dstAddress: PublicKey,
    txId: number,
    transferResultNotifyFlag: boolean,
    transferHash: number[],
    value: BN
  ) {
    const relayPda = getRelayPda(RELAYER_PROGRAM_ID, systemRelayOwner);
    const chainPda = getChainPda(RELAYER_PROGRAM_ID, dstChainId);

    await this.programAPI
      .sendMessage(
        relayOwner,
        dstChainId,
        srcAddress,
        dstAddress,
        txId,
        transferHash,
        transferResultNotifyFlag,
        value
      )
      .accountsPartial({
        authority: authority.publicKey,
        relayAccountOwner: relayOwner,
        systemRelayAccountOwner: systemRelayOwner,
        relayAccount: relayPda,
        chainAccount: chainPda,
      })
      .signers([authority])
      .rpc();
  }
}
