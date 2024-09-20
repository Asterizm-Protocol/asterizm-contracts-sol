import { Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  ATA_PROGRAM_ID,
  CLIENT_PROGRAM_ID,
  INftExampleProgramAPI,
  RELAYER_PROGRAM_ID,
} from "../program";
import BN from "bn.js";
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import {
  getAtaAccountPda,
  getChainPda,
  getIncomingTransferAccountPda,
  getOutgoingTransferAccountPda,
  getSenderAccountPda,
  getSettingsPda,
} from "../pda";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

export class Nft {
  constructor(private readonly programAPI: INftExampleProgramAPI) {}

  async receive(
    authority: Keypair,
    name: string,
    symbol: string,
    uri: string,
    transferHash: number[],
    srcChainId: BN,
    srcAddress: PublicKey,
    txId: BN,
    payload: Buffer,
    clientAccountPda: PublicKey,
    dstAddress: PublicKey,
    trustedAddress: PublicKey,
    clientProgramAddress?: PublicKey,
    relayProgramAddress?: PublicKey
  ): Promise<TransactionInstruction> {
    if (!clientProgramAddress) {
      clientProgramAddress = CLIENT_PROGRAM_ID;
    }
    if (!relayProgramAddress) {
      relayProgramAddress = RELAYER_PROGRAM_ID;
    }
    const chainAccount = getChainPda(relayProgramAddress, srcChainId);
    const clientSettingsAccount = getSettingsPda(clientProgramAddress);

    const transferAccountPda = getIncomingTransferAccountPda(
        clientProgramAddress,
      dstAddress,
      transferHash
    );

    const nftClientAccount = dstAddress;

    const clientSender = getSenderAccountPda(
        clientProgramAddress,
      dstAddress,
      authority.publicKey
    );

    return this.programAPI
      .receiveMessage(
        transferHash,
        srcAddress,
        srcChainId,
        txId,
        payload,
        uri,
        name,
        symbol
      )
      .accountsPartial({
        authority: authority.publicKey,
        nftClientAccount,
        systemProgram: SYSTEM_PROGRAM_ID,
        transferAccount: transferAccountPda,
        clientAccount: clientAccountPda,
        clientSettingsAccount,
        chainAccount,
        clientSender,
        relayerProgram: relayProgramAddress,
        clientProgram: clientProgramAddress,
        trustedAddress,
      })
      .signers([authority])
      .instruction();
  }
  
  async create(
    authority: Keypair,
    transferHash: number[],
    dstAddress: PublicKey,
    to: PublicKey,
    mint: Keypair
  ): Promise<TransactionInstruction> {

    const nftClientAccount = dstAddress;

    const tokenAccount = getAtaAccountPda(to, mint.publicKey);

    return this.programAPI
      .createNft(
        transferHash,
      )
      .accountsPartial({
        authority: authority.publicKey,
        mint: mint.publicKey,
        nftClientAccount,
        to,
        tokenAccount,
        associatedTokenProgram: ATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
        metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([authority, mint])
      .instruction();
  }

  async update(
    authority: Keypair,
    transferHash: number[],
    dstAddress: PublicKey,
    to: PublicKey,
    mint: PublicKey
  ): Promise<TransactionInstruction> {

    const nftClientAccount = dstAddress;

    return this.programAPI
      .updateNft(
        transferHash,
      )
      .accountsPartial({
        authority: authority.publicKey,
        nftClientAccount,
        mint,
        to,
        metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([authority])
      .instruction();
  }

  async burn(
    signer: Keypair,
    srcAddress: PublicKey,
    nftId: Buffer,
    dstChainId: BN,
    toAddress: PublicKey,
    transferHash: number[],
    uri: string,
    clientAccountPda: PublicKey,
    clientTrustedAddressPda: PublicKey,
    mint: PublicKey,
    clientProgramAddress?: PublicKey,
    relayProgramAddress?: PublicKey
  ): Promise<TransactionInstruction> {
    const nftClientAccount = srcAddress;
    if (!clientProgramAddress) {
      clientProgramAddress = CLIENT_PROGRAM_ID;
    }
    if (!relayProgramAddress) {
      relayProgramAddress = RELAYER_PROGRAM_ID;
    }

    const transferAccount = getOutgoingTransferAccountPda(
      clientProgramAddress,
      srcAddress,
      transferHash
    );

    const clientSettingsAccount = getSettingsPda(clientProgramAddress);

    const chainAccount = getChainPda(relayProgramAddress, dstChainId);

    return this.programAPI
      .burn([...nftId], dstChainId, toAddress, uri)
      .accountsPartial({
        signer: signer.publicKey,
        transferAccount,
        clientAccount: clientAccountPda,
        trustedAddress: clientTrustedAddressPda,
        clientSettingsAccount,
        nftClientAccount,
        chainAccount,
        mint,
        relayerProgram: relayProgramAddress,
        metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([signer])
      .instruction();
  }

  async mint(
      authority: Keypair,
      uri: string,
      name: string,
      symbol: string,
      dstAddress: PublicKey,
      to: PublicKey,
      mint: Keypair
  ): Promise<TransactionInstruction> {
    return this.programAPI
        .mintNft(
            uri,
            name,
            symbol
        )
        .accountsPartial({
          authority: authority.publicKey,
          mint: mint.publicKey,
          nftClientAccount: dstAddress,
          to,
          tokenAccount: getAtaAccountPda(to, mint.publicKey),
          associatedTokenProgram: ATA_PROGRAM_ID,
          systemProgram: SYSTEM_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        })
        .signers([authority, mint])
        .instruction();
  }
}
